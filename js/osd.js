"use strict";

function OSD(flightLog, canvas)
{
    var canvasContext = canvas.getContext("2d");

    this.drawOSD = function (frame)
    {
        function GetFriendlyFieldValueByName(fieldName)
        {
            return fieldValueToFriendly(fieldName, frame[flightLog.getMainFieldIndexByName(fieldName)]);
        }

        function drawTextValue(fieldName, posX, posY)
        {
            canvasContext.font = "bold 48px serif";
            canvasContext.fillStyle = "rgba(255,255,255,1.00)";
            canvasContext.fillText(GetFriendlyFieldValueByName(fieldName, frame), posX, posY);
        }

        canvasContext.save();
        
        
        drawTextValue("velocity", 100, 100);
        drawTextValue("DistHome", 100, 150);
        drawTextValue("navPos[2]", 100, 200);
        canvasContext.restore();
    }

   

    
    
    function fieldValueToFriendly(fieldName, value)
    {
        if (value === undefined)
            return "";

        switch (fieldName) {

            case 'time':
                return formatTime(value / 1000, true);
            
            case 'velocity':
                if (userSettings.velocityUnits == 'I') // Imperial
                    return (value * 0.0223694).toFixed(1) + " mph";
                if (userSettings.velocityUnits == 'M') // Metric
                    return (value * 0.036).toFixed(1) + " kph";
                return (value / 100).toFixed(2) + " m/s"; // Default

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
                return value;
        }
    }
}