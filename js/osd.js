"use strict";

function OSD(flightLog, canvas)
{
    var canvasContext = canvas.getContext("2d");
    var OSDsettings =
    {
        AspectRatio: 16 / 9,
        TextRowsCount: 20,
        TextColumnsCount: 40,
        RelFontSize: 1.0,
        Font : "serif"
    };
    var OSDitems = [
        {
            enabled : true,
            Field   : "velocity",
            posX    : 0,
            posY: 0,
            width : null
        },
        {
            enabled: true,
            Field: "DistHome",
            posX: 0,
            posY: 1,
            width : null
        },
        {
            enabled: true,
            Field: "time",
            posX: 0,
            posY: 2,
            width: null
        },
    ]



    function GetCanvasSizeWithAspectRatio()
    {
        var output =
        {
            width  : canvas.width,
            height : canvas.height,
            startX : 0,
            startY : 0
        };
        
        if ((canvas.width / canvas.height) > OSDsettings.AspectRatio)
        {
            output.width = Math.round(canvas.height * OSDsettings.AspectRatio);
            output.startX = Math.round( (canvas.width - (canvas.height * OSDsettings.AspectRatio)) / 2);
        }
        else if ((canvas.width / canvas.height) < OSDsettings.AspectRatio)
        {
            output.height = Math.round(canvas.width / OSDsettings.AspectRatio);
            output.startY = Math.round( (canvas.height - (canvas.width / OSDsettings.AspectRatio)) / 2 );
        };
        
        return output;
    }


    this.GetOSDitemCoords = function (index)
    {
        var out = {
            x: null,
            y: null
        };

        if (index != null)
        {
            out.x = OSDitems[index].posX;
            out.y = OSDitems[index].posY;
            return out;
        }

    }
    
    this.dragItem = function (itemIndex, mouseDownX, mouseDownY, mouseX, mouseY, itemOrigx, itemOrigy)
    {
         var 
            canvasParams = GetCanvasSizeWithAspectRatio(),
            xStep = canvasParams.width / OSDsettings.TextColumnsCount,
            yStep = canvasParams.height / OSDsettings.TextRowsCount,

             Xmove = Math.round((mouseX - mouseDownX) / xStep),
             Ymove = Math.round((mouseY - mouseDownY) / yStep);
        
        if (itemIndex != null)
        {
            if (OSDitems[itemIndex].enabled)
            {
                OSDitems[itemIndex].posX = Math.min(Math.max(itemOrigx + Xmove, 0), OSDsettings.TextColumnsCount - OSDitems[itemIndex].width);
                OSDitems[itemIndex].posY = Math.min(Math.max(itemOrigy + Ymove, 0), OSDsettings.TextRowsCount - 1);;
            }
        }
    }


    this.drawOSD = function (frame)
    {
        function GetFriendlyFieldValueByName(fieldName, frame)
        {
            return fieldValueToFriendly(fieldName, frame[flightLog.getMainFieldIndexByName(fieldName)], frame);
        }

        function drawTextValue(OSDitem)
        {
            
            var canvasParams = GetCanvasSizeWithAspectRatio(),
                
                xStep = canvasParams.width / OSDsettings.TextColumnsCount,
                yStep = canvasParams.height / OSDsettings.TextRowsCount,
                FontSize = yStep * OSDsettings.RelFontSize,
                text = GetFriendlyFieldValueByName(OSDitem.Field, frame);

            //prepare text format
            canvasContext.font = FontSize + "px " + OSDsettings.Font;
            canvasContext.fillStyle = "rgba(255,255,255,1.00)";

            OSDitem.width = Math.ceil(canvasContext.measureText(text).width / xStep);

            var Ypos = canvasParams.startY + yStep * (OSDitem.posY + 1) - (yStep - yStep * OSDsettings.RelFontSize / 1.5)/2;

            canvasContext.fillText(text, canvasParams.startX + xStep * OSDitem.posX, Ypos);
        }
         
        canvasContext.save();

        for (let OSDitem of OSDitems) {
            if (OSDitem.enabled)
            {
                drawTextValue(OSDitem);
            }
            
        }

        //canvasContext.font = 14 + "px " + OSDsettings.Font;
        //canvasContext.fillText(flightLog.parser.frameDefs[1], 200 , 200);  
        
        canvasContext.restore();
    }

    function load_html() {
        $('#content').load("./tabs/gps.html", process_html);
    }

    
    
    function fieldValueToFriendly(fieldName, value, frame)
    {
        if (value === undefined)
            return "";

        switch (fieldName) {

            case 'time':
                return formatTime(value / 1000, false);

            case 'DistHome':
                if (userSettings.velocityUnits == 'I') // Imperial
                    return (value / 30.48).toFixed(0) + " ft";
                if (userSettings.velocityUnits == 'M') // Metric
                {
                    if ((value / 100.0) < 100) return (value / 100.0).toFixed(1) + " m";
                    else if ((value / 100.0) < 950) return (value / 100.0).toFixed(0) + " m";
                    else return (value / 100000.0).toFixed(2) + " km";
                }
                
            default:
                return FlightLogFieldPresenter.decodeFieldToFriendly(flightLog, fieldName, value, frame[flightLog.getMainFieldIndexByName("flightModeFlags")]);
        }
    }

    //translate canvas coordinates to OSD grid indexes
    function CoordToOSDGrid(x, y)
    {
        var canvasParams = GetCanvasSizeWithAspectRatio(),
            xStep = canvasParams.width / OSDsettings.TextColumnsCount,
            yStep = canvasParams.height / OSDsettings.TextRowsCount;

        return {
            x: Math.floor((x - Math.round((canvas.width - canvasParams.width) / 2)) / xStep),
            y: Math.floor((y - Math.round((canvas.height - canvasParams.height) / 2)) / yStep)
        }
    }

    //determinate if coordinates in osd item grid
    function isInGridCoordsZone(x, y, gridX, gridY, gridW, gridH)
    {
        var gridCoords = CoordToOSDGrid(x, y);
        if ((gridCoords.x >= gridX) && (gridCoords.x < (gridX + gridW)) && (gridCoords.y >= gridY) && (gridCoords.y < (gridY + gridH)) )
        {
            return true;
        }
        else 
        {
            return false;
        }
    }

    //get OSD item index with mouse ccordinates
    this.GetOSDindexByCoords = function (mouseX, mouseY)
    {
        var result = null;

        for (var i = 0; i < OSDitems.length; i++) {
            if (OSDitems[i].enabled) {
                if (isInGridCoordsZone(mouseX, mouseY, OSDitems[i].posX, OSDitems[i].posY, OSDitems[i].width, 1))
                {
                    return i;
                }
            }

        }
    }


}