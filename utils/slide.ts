function getTranslate(el: Element, axis: "y" | "x" = "x") {
    let matrix;
    let curTransform;
    let transformMatrix;

    const curStyle = getComputedStyle(el, null);

    if (window.WebKitCSSMatrix) {
        curTransform = curStyle.transform || curStyle.webkitTransform;
        if (curTransform.split(",").length > 6) {
            curTransform = curTransform
                .split(", ")
                .map((a) => a.replace(",", "."))
                .join(", ");
        }
        // Some old versions of Webkit choke when 'none' is passed; pass
        // empty string instead in this case
        transformMatrix = new window.WebKitCSSMatrix(curTransform === "none" ? "" : curTransform);
    } else {
        transformMatrix =
            curStyle.MozTransform ||
            curStyle.OTransform ||
            curStyle.MsTransform ||
            curStyle.msTransform ||
            curStyle.transform ||
            curStyle.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,");
        matrix = transformMatrix.toString().split(",");
    }

    if (axis === "x") {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41;
        // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[12]);
        // Normal Browsers
        else curTransform = parseFloat(matrix[4]);
    }
    if (axis === "y") {
        // Latest Chrome and webkits Fix
        if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42;
        // Crazy IE10 Matrix
        else if (matrix.length === 16) curTransform = parseFloat(matrix[13]);
        // Normal Browsers
        else curTransform = parseFloat(matrix[5]);
    }
    return curTransform || 0;
}

export { getTranslate };
