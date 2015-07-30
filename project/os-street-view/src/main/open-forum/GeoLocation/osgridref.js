/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
/*  Ordnance Survey Grid Reference functions                          (c) Chris Veness 2005-2014  */
/*   - www.movable-type.co.uk/scripts/latlon-gridref.html                                         */
/*   - www.ordnancesurvey.co.uk/docs/support/guide-coordinate-systems-great-britain.pdf           */
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* jshint node:true *//* global define */
'use strict';
if (typeof module!='undefined' && module.exports) var LatLonE = require('./latlon-ellipsoid.js'); // CommonJS (Node.js)


/**
 * Creates an OsGridRef object.
 *
 * @classdesc Convert OS grid references to/from OSGB latitude/longitude points.
 * @requires  LatLonE
 *
 * @constructor
 * @param {number} easting - Easting in metres from OS false origin.
 * @param {number} northing - Northing in metres from OS false origin.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 */
function OsGridRef(easting, northing) {
    // allow instantiation without 'new'
    if (!(this instanceof OsGridRef)) return new OsGridRef(easting, northing);

    this.easting = Math.floor(Number(easting));   // truncate if necessary to left of 1m grid square
    this.northing = Math.floor(Number(northing)); // truncate if necessary to bottom of 1m grid square
}


/**
 * Converts (OSGB36) latitude/longitude to Ordnance Survey grid reference easting/northing coordinate.
 *
 * @param   {LatLonE}   point - OSGB36 latitude/longitude.
 * @returns {OsGridRef} OS Grid Reference easting/northing.
 * @throws  {Error}     If datum of point is not OSGB36.
 *
 * @example
 *   var p = new LatLonE(52.65757, 1.71791, LatLonE.datum.OSGB36);
 *   var grid = OsGridRef.latLonToOsGrid(p); // grid.toString(): TG 51409 13177
 */
OsGridRef.latLonToOsGrid = function(point) {
    if (point.datum != LatLonE.datum.OSGB36) throw new Error('Can only convert OSGB36 point to OsGrid');
    var th = point.lat.toRadians();
    var lm = point.lon.toRadians();

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var th0 = (49).toRadians(), lm0 = (-2).toRadians();  // NatGrid true origin is 49°N,2°W
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var costh = Math.cos(th), sinth = Math.sin(th);
    var v = a*F0/Math.sqrt(1-e2*sinth*sinth);            // nu = transverse radius of curvature
    var ph = a*F0*(1-e2)/Math.pow(1-e2*sinth*sinth, 1.5); // rho = meridional radius of curvature
    var na2 = v/ph-1;                                    // eta = ?

    var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (th-th0);
    var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(th-th0) * Math.cos(th+th0);
    var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(th-th0)) * Math.cos(2*(th+th0));
    var Md = (35/24)*n3 * Math.sin(3*(th-th0)) * Math.cos(3*(th+th0));
    var M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    var cos3th = costh*costh*costh;
    var cos5th = cos3th*costh*costh;
    var tan2th = Math.tan(th)*Math.tan(th);
    var tan4th = tan2th*tan2th;

    var I = M + N0;
    var II = (v/2)*sinth*costh;
    var III = (v/24)*sinth*cos3th*(5-tan2th+9*na2);
    var IIIA = (v/720)*sinth*cos5th*(61-58*tan2th+tan4th);
    var IV = v*costh;
    var V = (v/6)*cos3th*(v/ph-tan2th);
    var VI = (v/120) * cos5th * (5 - 18*tan2th + tan4th + 14*na2 - 58*tan2th*na2);

    var dltlm = lm-lm0;
    var dltlm2 = dltlm*dltlm, dltlm3 = dltlm2*dltlm, dltlm4 = dltlm3*dltlm, dltlm5 = dltlm4*dltlm, dltlm6 = dltlm5*dltlm;

    var N = I + II*dltlm2 + III*dltlm4 + IIIA*dltlm6;
    var E = E0 + IV*dltlm + V*dltlm3 + VI*dltlm5;

    return new OsGridRef(E, N); // gets truncated to SW corner of 1m grid square
};


/**
 * Converts Ordnance Survey grid reference easting/northing coordinate to (OSGB36) latitude/longitude
 *
 * @param   {OsGridRef} gridref - Easting/northing to be converted to latitude/longitude.
 * @returns {LatLonE}   Latitude/longitude (in OSGB36) of supplied grid reference.
 *
 * @example
 *   var grid = new OsGridRef(651409, 313177);
 *   var p = OsGridRef.osGridToLatLon(grid); // p.toString(): 52°39′27″N, 001°43′04″E
 */
OsGridRef.osGridToLatLon = function(gridref) {
    var E = gridref.easting + 0.5;  // easting of centre of 1m grid square
    var N = gridref.northing + 0.5; // northing of centre of 1m grid square

    var a = 6377563.396, b = 6356256.909;              // Airy 1830 major & minor semi-axes
    var F0 = 0.9996012717;                             // NatGrid scale factor on central meridian
    var th0 = 49*Math.PI/180, lm0 = -2*Math.PI/180;      // NatGrid true origin
    var N0 = -100000, E0 = 400000;                     // northing & easting of true origin, metres
    var e2 = 1 - (b*b)/(a*a);                          // eccentricity squared
    var n = (a-b)/(a+b), n2 = n*n, n3 = n*n*n;         // n, n², n³

    var th=th0, M=0;
    do {
        th = (N-N0-M)/(a*F0) + th;

        var Ma = (1 + n + (5/4)*n2 + (5/4)*n3) * (th-th0);
        var Mb = (3*n + 3*n*n + (21/8)*n3) * Math.sin(th-th0) * Math.cos(th+th0);
        var Mc = ((15/8)*n2 + (15/8)*n3) * Math.sin(2*(th-th0)) * Math.cos(2*(th+th0));
        var Md = (35/24)*n3 * Math.sin(3*(th-th0)) * Math.cos(3*(th+th0));
        M = b * F0 * (Ma - Mb + Mc - Md);              // meridional arc

    } while (N-N0-M >= 0.00001);  // ie until < 0.01mm

    var costh = Math.cos(th), sinth = Math.sin(th);
    var v = a*F0/Math.sqrt(1-e2*sinth*sinth);            // nu = transverse radius of curvature
    var ph = a*F0*(1-e2)/Math.pow(1-e2*sinth*sinth, 1.5); // rho = meridional radius of curvature
    var na2 = v/ph-1;                                    // eta = ?

    var tanth = Math.tan(th);
    var tan2th = tanth*tanth, tan4th = tan2th*tan2th, tan6th = tan4th*tan2th;
    var secth = 1/costh;
    var v3 = v*v*v, v5 = v3*v*v, v7 = v5*v*v;
    var VII = tanth/(2*ph*v);
    var VIII = tanth/(24*ph*v3)*(5+3*tan2th+na2-9*tan2th*na2);
    var IX = tanth/(720*ph*v5)*(61+90*tan2th+45*tan4th);
    var X = secth/v;
    var XI = secth/(6*v3)*(v/ph+2*tan2th);
    var XII = secth/(120*v5)*(5+28*tan2th+24*tan4th);
    var XIIA = secth/(5040*v7)*(61+662*tan2th+1320*tan4th+720*tan6th);

    var dE = (E-E0), dE2 = dE*dE, dE3 = dE2*dE, dE4 = dE2*dE2, dE5 = dE3*dE2, dE6 = dE4*dE2, dE7 = dE5*dE2;
    th = th - VII*dE2 + VIII*dE4 - IX*dE6;
    var lm = lm0 + X*dE - XI*dE3 + XII*dE5 - XIIA*dE7;

    return new LatLonE(th.toDegrees(), lm.toDegrees(), LatLonE.datum.OSGB36);
};


/**
 * Converts standard grid reference (eg 'SU387148') to fully numeric ref (eg [438700,114800]).
 *
 * @param   {string}    gridref - Standard format OS grid reference.
 * @returns {OsGridRef} Numeric version of grid reference in metres from false origin, centred on
 *   supplied grid square.
 *
 * @example
 *   var grid = OsGridRef.parse('TG 51409 13177'); // grid: { easting: 651409, northing: 313177 }
 */
OsGridRef.parse = function(gridref) {
    gridref = String(gridref).trim();
    // get numeric values of letter references, mapping A->0, B->1, C->2, etc:
    var l1 = gridref.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
    var l2 = gridref.toUpperCase().charCodeAt(1) - 'A'.charCodeAt(0);
    // shuffle down letters after 'I' since 'I' is not used in grid:
    if (l1 > 7) l1--;
    if (l2 > 7) l2--;

    // convert grid letters into 100km-square indexes from false origin (grid square SV):
    var e = ((l1-2)%5)*5 + (l2%5);
    var n = (19-Math.floor(l1/5)*5) - Math.floor(l2/5);
    if (e<0 || e>6 || n<0 || n>12) return new OsGridRef(NaN, NaN);

    // skip grid letters to get numeric part of ref, stripping any spaces:
    gridref = gridref.slice(2).replace(/ /g,'');

    // append numeric part of references to grid index:
    e += gridref.slice(0, gridref.length/2);
    n += gridref.slice(gridref.length/2);

    // normalise to 1m grid, rounding up to centre of grid square:
    switch (gridref.length) {
        case 0: e += '50000'; n += '50000'; break;
        case 2: e += '5000'; n += '5000'; break;
        case 4: e += '500'; n += '500'; break;
        case 6: e += '50'; n += '50'; break;
        case 8: e += '5'; n += '5'; break;
        case 10: break; // 10-digit refs are already 1m
        default: return new OsGridRef(NaN, NaN);
    }

    return new OsGridRef(e, n);
};


/**
 * Converts ‘this’ numeric grid reference to standard OS grid reference.
 *
 * @param   {number} [digits=6] - Precision of returned grid reference (6 digits = metres).
 * @returns {string} This grid reference in standard format.
 */
OsGridRef.prototype.toString = function(digits) {
    digits = (typeof digits == 'undefined') ? 10 : digits;
    var e = this.easting;
    var n = this.northing;
    if (isNaN(e) || isNaN(n)) return '??';

    // get the 100km-grid indices
    var e100k = Math.floor(e/100000), n100k = Math.floor(n/100000);

    if (e100k<0 || e100k>6 || n100k<0 || n100k>12) return '';

    // translate those into numeric equivalents of the grid letters
    var l1 = (19-n100k) - (19-n100k)%5 + Math.floor((e100k+10)/5);
    var l2 = (19-n100k)*5%25 + e100k%5;

    // compensate for skipped 'I' and build grid letter-pairs
    if (l1 > 7) l1++;
    if (l2 > 7) l2++;
    var letPair = String.fromCharCode(l1+'A'.charCodeAt(0), l2+'A'.charCodeAt(0));

    // strip 100km-grid indices from easting & northing, and reduce precision
    e = Math.floor((e%100000)/Math.pow(10,5-digits/2));
    n = Math.floor((n%100000)/Math.pow(10,5-digits/2));

    var gridRef = letPair + ' ' + e.pad(digits/2) + ' ' + n.pad(digits/2);

    return gridRef;
};


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */


/** Extend String object with method to trim whitespace from string
 *  (q.v. blog.stevenlevithan.com/archives/faster-trim-javascript) */
if (typeof String.prototype.trim == 'undefined') {
    String.prototype.trim = function() {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}


/** Extend Number object with method to pad with leading zeros to make it w chars wide
 *  (q.v. stackoverflow.com/questions/2998784 */
if (typeof Number.prototype.pad == 'undefined') {
    Number.prototype.pad = function(w) {
        var n = this.toString();
        while (n.length < w) n = '0' + n;
        return n;
    };
}


/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */
if (typeof module != 'undefined' && module.exports) module.exports = OsGridRef; // CommonJS
if (typeof define == 'function' && define.amd) define([], function() { return OsGridRef; }); // AMD
