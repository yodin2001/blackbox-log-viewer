"use strict";

function OSD(flightLog, canvas)
{
    var canvasContext = canvas.getContext("2d");

    function GetCanvasSizeWithAspectRatio()
    {
        var output =
        {
            width  : canvas.width,
            height : canvas.height,
            startX : 0,
            startY : 0
        };

        if ((canvas.width / canvas.height) > userSettings.OSDsettings.AspectRatio)
        {
            output.width = Math.round(canvas.height * userSettings.OSDsettings.AspectRatio);
            output.startX = Math.round((canvas.width - (canvas.height * userSettings.OSDsettings.AspectRatio)) / 2);
        }
        else if ((canvas.width / canvas.height) < userSettings.OSDsettings.AspectRatio)
        {
            output.height = Math.round(canvas.width / userSettings.OSDsettings.AspectRatio);
            output.startY = Math.round((canvas.height - (canvas.width / userSettings.OSDsettings.AspectRatio)) / 2 );
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
            out.x = userSettings.OSDitems[index].posX;
            out.y = userSettings.OSDitems[index].posY;
            return out;
        }

    }
    
    this.dragItem = function (itemIndex, mouseDownX, mouseDownY, mouseX, mouseY, itemOrigx, itemOrigy)
    {
         var 
             canvasParams = GetCanvasSizeWithAspectRatio(),
             xStep = canvasParams.width / userSettings.OSDsettings.TextColumnsCount,
             yStep = canvasParams.height / userSettings.OSDsettings.TextRowsCount,

             Xmove = Math.round((mouseX - mouseDownX) / xStep),
             Ymove = Math.round((mouseY - mouseDownY) / yStep);
        
        if (itemIndex != null)
        {
            if (userSettings.OSDitems[itemIndex].enabled)
            {
                userSettings.OSDitems[itemIndex].posX = Math.min(Math.max(itemOrigx + Xmove, 0), userSettings.OSDsettings.TextColumnsCount - userSettings.OSDitems[itemIndex].width);
                userSettings.OSDitems[itemIndex].posY = Math.min(Math.max(itemOrigy + Ymove, 0), userSettings.OSDsettings.TextRowsCount - 1);
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
                
                xStep = canvasParams.width / userSettings.OSDsettings.TextColumnsCount,
                yStep = canvasParams.height / userSettings.OSDsettings.TextRowsCount,
                FontSize = yStep * userSettings.OSDsettings.RelFontSize,
                text = GetFriendlyFieldValueByName(OSDitem.Field, frame);

            //prepare text format
            canvasContext.font = FontSize + "px " + userSettings.OSDsettings.Font;
            canvasContext.fillStyle = "rgba(255,255,255,1.00)";

            OSDitem.width = Math.ceil(canvasContext.measureText(text).width / xStep);

            var Ypos = canvasParams.startY + yStep * (OSDitem.posY + 1) - (yStep - yStep * userSettings.OSDsettings.RelFontSize / 1.5)/2;

            canvasContext.fillText(text, canvasParams.startX + xStep * OSDitem.posX, Ypos);
        }
         
        canvasContext.save();

        for (let OSDitem of userSettings.OSDitems) {
            if (OSDitem.enabled)
            {
                drawTextValue(OSDitem);
            }
            
        }
        
        canvasContext.restore();
    }

    
    function fieldValueToFriendly(fieldName, value, frame)
    {
        if (value === undefined)
            return "";

        switch (fieldName) {

            case 'time':
                return formatTime((value - flightLog.getMinTime())/ 1000, false);

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
            xStep = canvasParams.width / userSettings.OSDsettings.TextColumnsCount,
            yStep = canvasParams.height / userSettings.OSDsettings.TextRowsCount;

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

        for (var i = 0; i < userSettings.OSDitems.length; i++) {
            if (userSettings.OSDitems[i].enabled) {
                if (isInGridCoordsZone(mouseX, mouseY, userSettings.OSDitems[i].posX, userSettings.OSDitems[i].posY, userSettings.OSDitems[i].width, 1))
                {
                    return i;
                }
            }

        }
    }


}