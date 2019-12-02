"use strict";

function LeafletMap(flightLog, canvas, options)
{
    function GetCanvasSizeWithAspectRatio() {
        var output =
        {
            width: canvas.width,
            height: canvas.height,
            startX: 0,
            startY: 0
        };

        if ((canvas.width / canvas.height) > userSettings.OSDsettings.AspectRatio) {
            output.width = Math.round(canvas.height * userSettings.OSDsettings.AspectRatio);
            output.startX = Math.round((canvas.width - (canvas.height * userSettings.OSDsettings.AspectRatio)) / 2);
        }
        else if ((canvas.width / canvas.height) < userSettings.OSDsettings.AspectRatio) {
            output.height = Math.round(canvas.width / userSettings.OSDsettings.AspectRatio);
            output.startY = Math.round((canvas.height - (canvas.width / userSettings.OSDsettings.AspectRatio)) / 2);
        };

        return output;
    }
    this.resize = function ()
    {
        var canvasParams = GetCanvasSizeWithAspectRatio();

        div.style.left = canvasParams.startX + 0.01 * canvasParams.width + 'px';
        div.style.top = 119 + canvasParams.startY + 0.79 * canvasParams.height + 'px';
        div.style.height = 0.2 * canvasParams.height + 'px';
        div.style.width = 0.2 * canvasParams.width + 'px';
        
    }

    this.update = function (frame) {
        var canvasContext = canvas.getContext("2d");
        canvasContext.font = 20 + "px serif";
        canvasContext.fillStyle = "rgba(255,255,255,1.00)";
        
        canvasContext.fillText(frame[flightLog.getMainFieldIndexByName("attitude[2]")]/10 , 10, 280);
        canvasContext.fillText(flightLog.parser.getGPSData()[2] / 10000000, 10, 310);
        canvasContext.fillText(flightLog.parser.getGPSData()[3] / 10000000, 10, 340);
        canvasContext.fillText(flightLog.parser.getGPSData()[4] , 10, 370);
        canvasContext.fillText(flightLog.parser.getGPSData()[5] / 100 * 3.6, 10, 400);

        mymap.panTo([flightLog.parser.getGPSData()[2] / 10000000, flightLog.parser.getGPSData()[3] / 10000000]);
        UAVmarker.setLatLng([flightLog.parser.getGPSData()[2] / 10000000, flightLog.parser.getGPSData()[3] / 10000000]);
        UAVmarker.setRotationAngle(frame[flightLog.getMainFieldIndexByName("attitude[2]")] / 10);
    }
    

    var div = document.getElementById('mapid');
    
    
    var mymap = L.map('mapid').setView([0, 0], 13);
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {}).addTo(mymap);
    var myIcon = L.icon({
        iconUrl: 'leaflet/images/uav.png',
        iconSize: [48, 48]
 
    });
    var UAVmarker = new L.marker([0, 0], { icon: myIcon, rotationOrigin: "center" }).addTo(mymap);

}

