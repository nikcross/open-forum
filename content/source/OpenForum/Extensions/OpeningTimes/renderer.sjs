// Version: {{version}}
try {

        var mondayOpen = extension.getAttribute("mondayOpen");

        var mondayClose = extension.getAttribute("mondayClose");

        var tuesdayOpen = extension.getAttribute("tuesdayOpen");

        var tuesdayClose = extension.getAttribute("tuesdayClose");

        var wednesdayOpen = extension.getAttribute("wednesdayOpen");

        var wednesdayClose = extension.getAttribute("wednesdayClose");

        var thursdayOpen = extension.getAttribute("thursdayOpen");

        var thursdayClose = extension.getAttribute("thursdayClose");

        var fridayOpen = extension.getAttribute("fridayOpen");

        var fridayClose = extension.getAttribute("fridayClose");

        var saturdayOpen = extension.getAttribute("saturdayOpen");

        var saturdayClose = extension.getAttribute("saturdayClose");

        var sundayOpen = extension.getAttribute("sundayOpen");

        var sundayClose = extension.getAttribute("sundayClose");

        var content = "" + file.getAttachment("/OpenForum/Extensions/OpeningTimes","opening-times.html.template");

        content = content.replace(/{{mondayOpen}}/g, "" + mondayOpen);

        content = content.replace(/{{mondayClose}}/g, "" + mondayClose);

        content = content.replace(/{{tuesdayOpen}}/g, "" + tuesdayOpen);

        content = content.replace(/{{tuesdayClose}}/g, "" + tuesdayClose);

        content = content.replace(/{{wednesdayOpen}}/g, "" + wednesdayOpen);

        content = content.replace(/{{wednesdayClose}}/g, "" + wednesdayClose);

        content = content.replace(/{{thursdayOpen}}/g, "" + thursdayOpen);

        content = content.replace(/{{thursdayClose}}/g, "" + thursdayClose);

        content = content.replace(/{{fridayOpen}}/g, "" + fridayOpen);

        content = content.replace(/{{fridayClose}}/g, "" + fridayClose);

        content = content.replace(/{{saturdayOpen}}/g, "" + saturdayOpen);

        content = content.replace(/{{saturdayClose}}/g, "" + saturdayClose);

        content = content.replace(/{{sundayOpen}}/g, "" + sundayOpen);

        content = content.replace(/{{sundayClose}}/g, "" + sundayClose);

        return content;
} catch(e) {
        return "" + e;
}
