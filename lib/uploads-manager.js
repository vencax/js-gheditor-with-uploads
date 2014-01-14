// global: MarkerManager

var UploadManager = function (editor, imageMarkdownRegex) {
    var markerMgr = new MarkerManager(editor, imageMarkdownRegex);

    function findLine(result_id) {
        // try to find the right line to replace
        if (markerMgr.markers.hasOwnProperty(result_id) && markerMgr.markers[result_id].find()) {
            return editor.getLineHandle(markerMgr.markers[result_id].find().from.line);
        }

        return false;
    }

    function checkLine(ln, mode) {
        var line = editor.getLineHandle(ln),
            isImage = line.text.match(imageMarkdownRegex),
            hasMarker;

        // We care if it is an image
        if (isImage) {
            hasMarker = line.text.match(markerMgr.markerRegex);

            if (hasMarker && mode === 'paste') {
                // this could be a duplicate, and won't be a real marker
                markerMgr.stripMarkerFromLine(line);
            }

            if (!hasMarker) {
                markerMgr.addMarker(line, ln);
            }
        }
        // TODO: hasMarker but no image?
    }

    function handleUpload(e, result_src) {
        /*jslint regexp: true, bitwise: true */
        var line = findLine($(e.currentTarget).attr('id')),
            lineNumber = editor.getLineNumber(line),
            match = line.text.match(/\([^\n]*\)?/),
            replacement = '(http://)';
        /*jslint regexp: false, bitwise: false */

        if (match) {
            // simple case, we have the parenthesis
            editor.setSelection({line: lineNumber, ch: match.index + 1}, {line: lineNumber, ch: match.index + match[0].length - 1});
        } else {
            match = line.text.match(/\]/);
            if (match) {
                editor.replaceRange(
                    replacement,
                    {line: lineNumber, ch: match.index + 1},
                    {line: lineNumber, ch: match.index + 1}
                );
                editor.setSelection(
                    {line: lineNumber, ch: match.index + 2},
                    {line: lineNumber, ch: match.index + replacement.length }
                );
            }
        }
        editor.replaceSelection(result_src);
    }

    function getEditorValue() {
        var value = editor.getValue();

        _.each(markerMgr.markers, function (marker, id) {
            value = value.replace(markerMgr.getMarkerRegexForId(id), '');
        });

        return value;
    }
    
    // Public API
    _.extend(this, {
        getEditorValue: getEditorValue,
        handleUpload: handleUpload
    });

    // initialise
    editor.on('change', function (cm, changeObj) {
        var linesChanged = _.range(changeObj.from.line, changeObj.from.line + changeObj.text.length);

        _.each(linesChanged, function (ln) {
            checkLine(ln, changeObj.origin);
        });

        // Is this a line which may have had a marker on it?
        markerMgr.checkMarkers();
    });
};