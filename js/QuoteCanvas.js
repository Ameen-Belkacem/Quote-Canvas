/**
 * QuoteCanvas: Touch supporting canvas built for social media quotes
 * @copyright Ameen Belkacem 2015
 * @version 0.2
 * @license Apache-2.0
 * @todo The library is currently basic, further developement is planned.
 * @todo More testing required.
 */

/**
 * The QuoteCanvas Constructor
 * @param {number} arg1 The width of the canvas.
 * @param {number} arg2 The height of the canvas.
 * @constructor
 */
function QuoteCanvas(arg1, arg2) {
    this.id = null;
    this.canvas = null;
    this.context = null;
    this.width = arg1;
    this.height = arg2;

    var self = this;
    var isCreate = function (args) {
        return (
            args.length == 2 &&
            self.isDimension(args[0]) &&
            self.isDimension(args[1])
        );
    };
    var isEdit = function (args) {
        return args.length == 1 && args[0].nodeName == "CANVAS";
    };

    this.delegate = function (obj) {
        this.canvas = obj;
        this.context = obj.getContext("2d");
        this.id = obj.id;
        this.width = obj.width;
        this.height = obj.height;
    };

    this.create = function (width, height) {
        var canvas = document.createElement("canvas");
        var body = document.getElementsByTagName("body")[0];
        body.appendChild(canvas);
        canvas.id = "QuoteCanvs";
        canvas.width = width;
        canvas.height = height;
        this.delegate(canvas);
    };

    var mode = isCreate(arguments) ? 1 : isEdit(arguments) ? 2 : 0;

    if (mode == 1) this.create(arg1, arg2);
    else if (mode == 2) this.delegate(arg1);
    else return;

    this._initListeners();
}

QuoteCanvas.prototype = {
    // Checkers and Type Validators Section

    isDef: function (value) {
        return !(typeof value == "undefined");
    },

    isObj: function (value) {
        return (
            typeof value === "object" && !Array.isArray(value) && value !== null
        );
    },

    hasProp: function (obj, prop) {
        var proto = obj.__proto__ || obj.constructor.prototype;
        return prop in obj && (!(prop in proto) || proto[prop] !== obj[prop]);
    },

    isArray: function (value) {
        return !!value && value.constructor === Array;
    },

    inArray: function (array, value) {
        return array.indexOf(value) > -1;
    },

    isFunc: function (value) {
        return Object.prototype.toString.call(value) == "[object Function]";
    },

    isStr: function (variable) {
        return typeof variable === "string" || variable instanceof String;
    },

    isInt: function (value) {
        return value === parseInt(value, 10) || /^\+?(0|[1-9]\d*)$/.test(value);
    },

    isNumber: function (value) {
        return typeof value == "number" && !isNaN(value) && isFinite(value);
    },

    isNat: function (value) {
        return this.isInt(value) && value >= 0;
    },

    isNull: function (value) {
        return value == null;
    },

    isBetween: function (value, a, b) {
        return value >= a && value <= b;
    },

    isOfType: function (type, value) {
        switch (type) {
            case "Id":
                if (!this.isNat(value)) return false;
                return this._getElementById(value) != "undefined";
            case "Element":
                return this.inArray(["text", "image", "shape"], value);
            case "Nat":
                return this.isNat(value);
            case "Str":
                return this.isStr(value) && value != "";
            case "Bool":
                return (value = true) || (value = false);
            case "Any":
                return true;
            case "PosX":
                return this.isNumber(value) && value <= this.width;
            case "PosY":
                return this.isNumber(value) && value <= this.height;
            case "Color":
                return this.isColor(value);
            case "Align":
                return this.inArray(["center", "left", "right"], value);
        }
        return false;
    },

    isColor: function (color) {
        return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(color);
    },

    isDimension: function (value) {
        return this.isInt(value) && value > 0;
    },

    isInstanceOf: function (object, instance) {
        return this.objects._isInstanceOf.call(this, object, instance);
    },

    isStyle: function (style) {
        if (!this.isDef(style)) return false;
        return this.isInstanceOf(style, "style");
    },

    isElement: function (element) {
        if (!this.isDef(element)) return false;
        return this.isInstanceOf(element, "element");
    },

    isPosition: function (position) {
        return (
            this.isDef(position.x) &&
            position.x <= this.width &&
            this.isDef(position.y) &&
            position.y <= this.height
        );
    },

    isWidth: function (width) {
        if (this.isNull(width)) return true;
        return this.isDef(width) && this.isNat(width);
    },

    isSize: function (size) {
        return (
            this.isDef(size.width) &&
            this.isDef(size.height) &&
            this.isNat(size.width) &&
            this.isNat(size.height)
        );
    },

    isPath: function (path) {
        return (
            this.isDef(path) &&
            /([a-z\-_0-9\/\:\.]*\.(jpg|jpeg|png|gif|svg))/i.test(path)
        );
    },

    objects: {
        element: {
            id: "Id",
            zindex: "Nat",
            resource: "Any",
            width: "Nat",
            height: "Nat",
            x: "PosX",
            y: "PosY",
            style: "style",
            type: "Element",
            fixed: "Bool",
        },
        style: {
            font: "Str",
            color: "Color",
            fontSize: "Nat",
            fontType: "Str",
            lineHeight: "Nat",
            textAlign: "Align",
            shadow: "shadow",
            outline: "outline",
        },
        shadow: {
            x: "PosX",
            y: "PosY",
            color: "Color",
            blur: "Nat",
        },
        outline: {
            color: "Color",
            thickness: "Nat",
        },

        _getObjProps: function (objName) {
            var props = [];
            for (var prop in this[objName]) {
                props.push(prop);
            }
            return props;
        },

        /**
         * Checks if an object is an instance of another.
         * @param {object} object An object to be checked.
         * @param {object} instance The instance of the object.
         * @private
         * @return {bool} The updated object.
         */
        _isInstanceOf: function (object, instance) {
            var objects = this.objects;
            var objProps = objects._getObjProps(instance);
            for (var prop in object) {
                if (this.inArray(objProps, prop)) {
                    if (this.isObj(object[prop])) {
                        if (
                            !objects._isInstanceOf.call(
                                this,
                                object[prop],
                                prop
                            )
                        )
                            return false;
                    } else if (
                        !this.isOfType(objects[instance][prop], object[prop])
                    )
                        return false;
                }
            }
            return true;
        },

        /**
         * Updates an Object
         * @param {object} obj The object to be updated.
         * @param {object} update The update object.
         * @return {object} The updated object.
         */
        _updateObj: function (object, update) {
            for (var key in update) {
                if (object.hasOwnProperty(key)) {
                    if (this.isObj(update[key])) {
                        object[key] = this.objects._updateObj.call(
                            this,
                            object[key],
                            update[key]
                        );
                    } else object[key] = update[key];
                }
            }
            return object;
        },
    },

    // Shape Related Section

    _drawContainer: function (position, size) {
        return this._drawShape(
            "rect",
            { outline: true, color: "#ffffff", lineWidth: 1 },
            position,
            size
        );
    },

    /**
     * Draws a background color to the canvas
     * @param {color} color The fill color of the background.
     * @param {element} The background element.
     */
    drawBG: function (color) {
        if (!this.isColor(color)) return undefined;
        return this.drawRect(
            color,
            { x: 0, y: 0 },
            this.width,
            this.height,
            true
        );
    },

    /**
     * Draws a shape to the canvas
     * @param {string} type The type of the shape.
     * @param {object} style The Object containing styles.
     * @param {object} position An object containing x & y  of the shape.
     * @param {object} size An object containing height & width of the shape.
     * @todo Circle, triangle and other shapes support.
     */
    _drawShape: function (type, style, position, size) {
        this.context.beginPath();
        if (type == "rect") {
            if (!style.outline) {
                this.context.fillStyle = style.color;
                this.context.rect(
                    position.x,
                    position.y,
                    size.width,
                    size.height
                );
                this.context.fill();
            } else {
                this.context.lineWidth = style.lineWidth;
                this.context.strokeStyle = style.color;
                this.context.rect(
                    position.x,
                    position.y,
                    size.width,
                    size.height
                );
                this.context.stroke();
            }
        }
    },

    /**
     * Draws a rectangle to the canvas
     * @param {color} color The fill color of the rectangle.
     * @param {object} position An object containing x & y  of the rectangle.
     * @param {object} size An object containing height & width of the rectangle.
     * @param {bool} fixed A flag indicating the moveability of the rectangle.
     * @return {element} An element object.
     */
    drawRect: function (color, position, size, fixed) {
        if (
            !this.isColor(color) ||
            !this.isPosition(position) ||
            !this.isSize(size)
        )
            return undefined;
        if (!this.isDef(fixed)) fixed = false;

        if (this.isNull(position.x))
            position.x = this._getPosition(size.width, size.height).x;
        if (this.isNull(position.y))
            position.y = this._getPosition(size.width, size.height).y;

        this._drawShape(
            "rect",
            { outline: false, color: color },
            position,
            size
        );

        return this._createElement("shape", position, size, color, {}, fixed);
    },

    _redrawRect: function (id) {
        var element = this._getElementById(id);
        this.context.save();
        this._drawShape(
            "rect",
            { outline: false, color: element.resource },
            { x: element.x, y: element.y },
            { width: element.width, height: element.height }
        );
        this.context.restore();
    },

    // Image Related Section

    /**
     * Draws a background image to the canvas
     * @param {string} path The path to the background image.
     * @param {element} The background element.
     */
    drawBGImage: function (path, callback) {
        if (!this.isPath(path)) return undefined;
        this.drawImage(
            path,
            {},
            { x: 0, y: 0 },
            { width: this.width, height: this.height },
            callback,
            true
        );
    },

    /**
     * Draws an image to the canvas
     * @param {string} path The path to image file.
     * @param {style} style The Object containing styles.
     * @param {object} position An object containing x & y of the image.
     * @param {object} size An object containing height & width of the image.
     * @param {function} callback A function to be called after loading the image.
     * @param {bool} fixed A flag indicating the moveability of the image.
     */
    drawImage: function (path, style, position, size, callback, fixed) {
        if (
            !this.isPath(path) ||
            !this.isStyle(style) ||
            !this.isPosition(position) ||
            !this.isSize(size)
        )
            return undefined;
        if (this.isDef(callback) && !this.isFunc(callback)) return undefined;
        if (!this.isDef(fixed)) fixed = false;

        var image = new Image();
        image.src = path;
        // Uncomment the line above to be able to use remotly hosted images
        // image.setAttribute('crossOrigin', '');

        image.onload = function () {
            this.context.save();
            this._applyStyle(style);

            if (this.isNull(position.x))
                position.x = this._getPosition(size.width, size.height).x;
            if (this.isNull(position.y))
                position.y = this._getPosition(size.width, size.height).y;

            this.context.drawImage(
                image,
                position.x,
                position.y,
                size.width,
                size.height
            );
            this.context.restore();

            var element = this._createElement(
                "image",
                position,
                size,
                image,
                style,
                fixed
            );
            if (this.isDef(callback)) callback(element);
        }.bind(this);
    },

    _redrawImage: function (id) {
        var element = this._getElementById(id);
        this.context.save();
        this._applyStyle(element.style);
        this.context.drawImage(
            element.resource,
            element.x,
            element.y,
            element.width,
            element.height
        );
        this.context.restore();
    },

    // Text Related Section

    /**
     * Extracts text lines from a string according to line width.
     * @param {string} text The string to be broken into an array.
     * @param {number} width The max-width of a single line.
     * @return {array} An array containinig all text lines.
     */
    _extractLines: function (text, width) {
        var words = text.split(" ");
        var line = "";
        var lines = [];
        for (i = 0; i <= words.length - 1; i++) {
            var testLine = line + words[i];
            var lineWidth = this.context.measureText(testLine).width;
            if (lineWidth > width) {
                lines.push({
                    line: line.slice(0, -1),
                });
                line = words[i];
                if (i < words.length - 1) line += " ";
            } else {
                line = testLine;
                if (i == words.length - 1)
                    lines.push({
                        line: line,
                    });
                if (i < words.length - 1) line += " ";
            }
        }
        return lines;
    },

    /**
     * Sets the y-position of every line of text.
     * @param {array} lines An array containinig all text lines.
     * @param {number} y The start y-position of the lines.
     * @param {number} lineHeight The lineheight of every line.
     * @return {array} An array containinig vertically aligned text lines.
     */
    _alignLinesV: function (lines, y, lineHeight) {
        for (i = 0; i <= lines.length - 1; i++) {
            y += lineHeight;
            lines[i].y = y;
        }
        return lines;
    },

    /**
     * Sets the x-position of every line of text.
     * @param {array} lines An array containinig all text lines.
     * @param {string} alignment The alignment of text lines.
     * @param {number} x The start x-position of the lines
     * @param {number} width The max-width of a single line.
     * @return {array} An array containinig horizontally aligned text lines.
     * @todo Include left and right alignment.
     */
    _alignLinesH: function (lines, alignment, width, x) {
        var lineWidth;
        if (alignment == "center") {
            for (i = 0; i <= lines.length - 1; i++) {
                lineWidth = this.context.measureText(lines[i].line).width;
                if (lineWidth < width) lines[i].x = (width - lineWidth) / 2 + x;
            }
        } else if (alignment == "right") {
            for (i = 0; i <= lines.length - 1; i++) {
                lineWidth = this.context.measureText(lines[i].line).width;
                lines[i].x = width - lineWidth + x;
            }
        } else {
            for (i = 0; i <= lines.length - 1; i++) {
                lines[i].x = x;
            }
        }
        return lines;
    },

    _drawLines: function (lines, x, y, width, height, hasOutline) {
        var current;
        var shadowColor = this.context.shadowColor;
        for (i = 0; i <= lines.length - 1; i++) {
            current = lines[i];
            if (current.y - y > height) break;
            this.context.shadowColor = shadowColor;
            this.context.fillText(current.line, current.x, current.y);
            if (hasOutline) {
                this.context.shadowColor = "transparent";
                this.context.strokeText(current.line, current.x, current.y);
            }
        }
    },

    _hasOutline: function (style) {
        return this.isDef(style.outline);
    },

    _getTextWidth: function (str) {
        var width = parseInt(this.context.measureText(str).width) + 1;
        if (width > this.width) width = this.width - 30;
        return width;
    },

    _getTextHeight: function (linesCount, lineHeight) {
        return linesCount * lineHeight + lineHeight / 2;
    },

    _getLineHeight: function () {
        var font = this.context.font;
        var fontArray = font.split(" ");

        if (fontArray.length == 2)
            font = parseInt(fontArray[0].substr(0, fontArray[0].indexOf("p")));
        else font = parseInt(fontArray[1].substr(0, font.indexOf("p")));

        return font + 10;
    },

    _getTextAlign: function () {
        return "center";
    },

    _applyTextStyle: function (style) {
        if (this.isDef(style.color)) this.context.fillStyle = style.color;

        var font = "";
        if (this.isDef(style.fontType)) font = style.fontType;
        if (this.isDef(style.fontSize)) font += " " + style.fontSize + "px";
        if (this.isDef(style.font)) font += " " + style.font;

        this._applyStyle(style);
        this.context.font = font;
    },

    /**
     * Draws a text to the canvas
     * @param {string} str The text string.
     * @param {style} style The Object containing styles.
     * @param {object} position An object containing x & y  of the text.
     * @param {object} size An object containing height & width of the text.
     * @param {bool} fixed A flag indicating the moveability of the text.
     * @return {element} An element object.
     */
    drawText: function (str, style, position, width, fixed) {
        if (
            !this.isStr(str) ||
            !this.isStyle(style) ||
            !this.isPosition(position) ||
            !this.isWidth(width)
        )
            return undefined;
        if (!this.isDef(fixed)) fixed = false;

        this.context.save();
        this._applyTextStyle(style);

        if (!this.isDef(style.lineHeight))
            style.lineHeight = this._getLineHeight();
        if (!this.isDef(style.textAlign))
            style.textAlign = this._getTextAlign();
        if (this.isNull(width)) width = this._getTextWidth(str);

        var lines = this._extractLines(str, width);
        var height = this._getTextHeight(lines.length, style.lineHeight);

        if (this.isNull(position.x))
            position.x = this._getPosition(width, height).x;
        if (this.isNull(position.y))
            position.y = this._getPosition(width, height).y;

        lines = this._alignLinesV(lines, position.y, style.lineHeight);
        lines = this._alignLinesH(lines, style.textAlign, width, position.x);

        this._drawLines(
            lines,
            position.x,
            position.y,
            width,
            height,
            this._hasOutline(style)
        );
        this.context.restore();

        return this._createElement(
            "text",
            position,
            { width: width, height: height },
            str,
            style,
            fixed
        );
    },

    _redrawText: function (id) {
        var element = this._getElementById(id);

        this.context.save();
        this._applyTextStyle(element.style);

        var lines = this._extractLines(element.resource, element.width);
        var style = element.style;
        lines = this._alignLinesV(lines, element.y, style.lineHeight);
        lines = this._alignLinesH(
            lines,
            style.textAlign,
            element.width,
            element.x
        );

        this._drawLines(
            lines,
            element.x,
            element.y,
            element.width,
            element.height,
            this._hasOutline(element.style)
        );
        this.context.restore();
    },

    // Styling Related Section

    _applyShadow: function (shadow) {
        if (this.isDef(shadow.color)) this.context.shadowColor = shadow.color;
        if (this.isDef(shadow.blur)) this.context.shadowBlur = shadow.blur;
        if (this.isDef(shadow.x)) this.context.shadowpositionX = shadow.x;
        if (this.isDef(shadow.y)) this.context.shadowpositionY = shadow.y;
    },

    _applyOutline: function (outline) {
        if (this.isDef(outline.color)) this.context.strokeStyle = outline.color;
        if (this.isDef(outline.thickness))
            this.context.lineWidth = this.context.strokeStyle;
    },

    _applyStyle: function (style) {
        if (this.isDef(style.shadow)) this._applyShadow(style.shadow);
        if (this.isDef(style.outline)) this._applyOutline(style.outline);
    },

    // Elements Related Section

    /**
     * @type {element} An object containing the currently active element.
     * @private
     */
    _element: {},

    /**
     * @type {array} An array containing all the elements.
     * @private
     */
    _elements: [],

    _elementsCount: -1,

    _zindex: 0,

    _generateZindex: function () {
        this._zindex += 1;
        return this._zindex;
    },
    _generateId: function () {
        this._elementsCount += 1;
        return this._elementsCount;
    },

    getActiveElement: function () {
        return this._element;
    },

    getAllElements: function () {
        return this._elements;
    },

    _createElement: function (type, position, size, resource, style, fixed) {
        var id = this._generateId();
        var zindex = this._generateZindex();
        var element = {
            id: id,
            type: type,
            zindex: zindex,
            x: position.x,
            y: position.y,
            width: size.width,
            height: size.height,
            resource: resource,
            style: style,
            fixed: fixed,
        };
        this._elements.push(element);
        return element;
    },

    _getElementById: function (id) {
        for (i = 0; i <= this._elements.length; i++) {
            if (this._elements[i].id == id) return this._elements[i];
        }
        return undefined;
    },

    _getElementIndex: function (id) {
        for (i = 0; i <= this._elements.length - 1; i++) {
            if (this._elements[i].id == id) return i;
        }
        return -1;
    },

    /**
     * @returns {element} Returns the current active element.
     */
    getActiveElement: function () {
        return this._element;
    },

    /**
     * @returns {number} Returns the current active element.
     */
    getActiveElementId: function () {
        return this.element.id;
    },

    // Interaction Handling Section

    _getPosition: function (width, height) {
        return {
            x: (this.width - width) / 2,
            y: (this.height - height) / 2,
        };
    },

    /**
     * Gets the position of a finger touch or a mouse click.
     * @param {event} event Object of type event.
     * @return {objet} An object containing x & y .
     * @private
     */
    _getfocusPos: function (event) {
        if (this.isDef(event.pageX) && this.isDef(event.pageY)) {
            return {
                x: event.pageX,
                y: event.pageY,
            };
        } else if (
            event.targetTouches[0].pageX &&
            event.targetTouches[0].pageY
        ) {
            return {
                x: event.targetTouches[0].pageX,
                y: event.targetTouches[0].pageY,
            };
        }
    },

    /**
     * Gets the element with the highest z-index in a specified position.
     * @param {object} focusPos containing x & y .
     * @return {element} An element object.
     * @private
     */
    _getFocusElement: function (focusPos) {
        var elementsInPos = [];
        var current;
        for (i = 0; i <= this._elements.length - 1; i++) {
            current = this._elements[i];
            if (
                this.isBetween(
                    focusPos.x,
                    current.x,
                    current.x + current.width
                ) &&
                this.isBetween(
                    focusPos.y,
                    current.y,
                    current.y + current.height
                )
            )
                elementsInPos.push(i);
        }

        if (elementsInPos.length > 0) {
            var latest = this._elements[elementsInPos[0]];
            for (i = 0; i <= elementsInPos.length - 1; i++) {
                var current = this._elements[elementsInPos[i]];
                if (current.zindex > latest.zindex) latest = current;
            }
            return latest;
        } else return undefined;
    },

    _actionHandler: function (event) {
        var focusPos;
        if (event.type == "touchstart" || event.type == "mousedown") {
            this._noMovement = false;
            focusPos = this._getfocusPos(event);
            var element = this._getFocusElement(focusPos);
            if (element && !element.fixed) {
                this._element = element;
                this._element.focusPos = focusPos;
                this.redraw();
                this._drawContainer(
                    { x: element.x, y: element.y },
                    { width: element.width, height: element.height }
                );
            } else {
                this._element = {};
                this._noMovement = true;
                this.redraw();
                event.preventDefault();
            }
        }

        if (event.type == "touchmove" || event.type == "mousemove") {
            if (this._noMovement) return;
            event.preventDefault();
            focusPos = this._getfocusPos(event);
            this.move(this._element.id, focusPos);
        }

        if (event.type == "touchend" || event.type == "mouseup") {
            this._noMovement = true;
        }
    },

    _initListeners: function () {
        this.canvas.addEventListener(
            "touchstart",
            this._actionHandler.bind(this),
            false
        );
        this.canvas.addEventListener(
            "touchmove",
            this._actionHandler.bind(this),
            false
        );
        this.canvas.addEventListener(
            "touchend",
            this._actionHandler.bind(this),
            false
        );
        this.canvas.addEventListener(
            "mousedown",
            this._actionHandler.bind(this),
            false
        );
        this.canvas.addEventListener(
            "mousemove",
            this._actionHandler.bind(this),
            false
        );
        this.canvas.addEventListener(
            "mouseup",
            this._actionHandler.bind(this),
            false
        );
    },

    /**
     * @type {bool} A flag used to switch mouse movement on/off.
     * @private
     */
    _noMovement: false,

    /**
     * Moves an element.
     * @param {number} id The id of the element to be moved.
     * @param {object} position An object containing the x & y .
     * @return {bool} True/False
     */
    move: function (id, position) {
        if (!this.isInt(id)) return false;
        if (!this.isPosition(position)) return false;

        var element = this._getElementById(id);
        if (this.isDef(element)) {
            var lastX = element.focusPos.x;
            var lastY = element.focusPos.y;
            if (lastX > position.x) {
                xdiff = lastX - position.x;
                element.x = element.x - xdiff;
            } else {
                xdiff = position.x - lastX;
                element.x = element.x + xdiff;
            }
            if (lastY > position.y) {
                ydiff = lastY - position.y;
                element.y = element.y - ydiff;
            } else {
                ydiff = position.y - lastY;
                element.y = element.y + ydiff;
            }
            element.focusPos.x = position.x;
            element.focusPos.y = position.y;

            this.update(id, element);
            this.redraw();

            this._drawContainer(
                { x: element.x, y: element.y },
                { width: element.width, height: element.height }
            );
        } else return false;
        return true;
    },

    /**
     * Updates an element.
     * @param {number} id The id of the element to be updated.
     * @param {element} update The element's update.
     * @return {element} Returns the updated element or undefined.
     */
    update: function (id, update) {
        if (!this.isNat(id) || !this.isDef(update)) return undefined;
        if (!this.isElement(update)) return undefined;

        var element = this._getElementById(id);
        if (!this.isDef(element)) return undefined;

        this._elements[id] = this.objects._updateObj.call(
            this,
            element,
            update
        );
        return element;
    },

    /**
     * Erases an element.
     * @param {number} id The id of the element to be erased.
     * @return {bool} True/False.
     */
    erase: function (id) {
        if (!this.isDef(id) || !this.isNat(id)) return false;

        var element = this._getElementById(id);
        if (!this.isElement(element)) return false;

        this._elements.splice(id, 1);
        this.redraw();
        return true;
    },

    /**
     * Redraws all the elements according to the z-index order.
     */
    redraw: function () {
        var sorted = this._elements.sort(function (a, b) {
            return a.zindex - b.zindex;
        });
        this.context.clearRect(0, 0, this.width, this.height);
        for (var i = 0; i <= sorted.length - 1; i++) {
            if (this._elements[i].type == "text") {
                this._redrawText(this._elements[i].id);
            }
            if (this._elements[i].type == "image") {
                this._redrawImage(this._elements[i].id);
            }
            if (this._elements[i].type == "shape") {
                this._redrawRect(this._elements[i].id);
            }
        }
    },
};
