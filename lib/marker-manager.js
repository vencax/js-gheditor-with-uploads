var MarkerManager = function (editor, imageMarkdownRegex) {
    var markers = {},
        uploadPrefix = 'image_upload',
        uploadId = 1;
        
    var markerRegex = /\{<([\w\W]*?)>\}/;

    function addMarker(line, ln) {
        var marker,
            magicId = '{<' + uploadId + '>}';
        editor.setLine(ln, magicId + line.text);
        marker = editor.markText(
            {line: ln, ch: 0},
            {line: ln, ch: (magicId.length)},
            {collapsed: true}
        );

        markers[uploadPrefix + '_' + uploadId] = marker;
        uploadId += 1;
    }

    function getMarkerRegexForId(id) {
        id = id.replace('image_upload_', '');
        return new RegExp('\\{<' + id + '>\\}', 'gmi');
    }

    function stripMarkerFromLine(line) {
        var markerText = line.text.match(markerRegex),
            ln = editor.getLineNumber(line);

        if (markerText) {
            editor.replaceRange('', {line: ln, ch: markerText.index}, {line: ln, ch: markerText.index + markerText[0].length});
        }
    }

    function findAndStripMarker(id) {
        editor.eachLine(function (line) {
            var markerText = getMarkerRegexForId(id).exec(line.text),
                ln;

            if (markerText) {
                ln = editor.getLineNumber(line);
                editor.replaceRange('', {line: ln, ch: markerText.index}, {line: ln, ch: markerText.index + markerText[0].length});
            }
        });
    }

    function removeMarker(id, marker, line) {
        delete markers[id];
        marker.clear();

        if (line) {
            stripMarkerFromLine(line);
        } else {
            findAndStripMarker(id);
        }
    }

    function checkMarkers() {
        _.each(markers, function (marker, id) {
            var line;
            marker = markers[id];
            if (marker.find()) {
                line = editor.getLineHandle(marker.find().from.line);
                if (!line.text.match(imageMarkdownRegex)) {
                    removeMarker(id, marker, line);
                }
            } else {
                removeMarker(id, marker);
            }
        });
    }

    function initMarkers(line) {
        var isImage = line.text.match(imageMarkdownRegex),
            hasMarker = line.text.match(markerRegex);

        if (isImage && !hasMarker) {
            addMarker(line, editor.getLineNumber(line));
        }
    }
    
    // public api
    _.extend(this, {
        markers: markers,
        checkMarkers: checkMarkers,
        addMarker: addMarker,
        stripMarkerFromLine: stripMarkerFromLine,
        getMarkerRegexForId: getMarkerRegexForId,
        markerRegex: markerRegex
    });

    // Initialise
    editor.eachLine(initMarkers);
};