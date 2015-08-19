/**
 * Created by ernest on 18/08/15.
 */

var Application = function() {
    this._searchInProgress = false;
    this._$searchBox = $("#search");
    this._$info = $("#info");
    this._$results = $("#results");
};

Application.prototype.searchInProgress = function() {
    return this._searchInProgress;
};

Application.prototype.switchToSearchMode = function (infoText) {
    if (arguments.length === 0) {
        self._searchInProgress = true;
        this._$searchBox.prop('disabled', true);
        this._$info.text('Search is in progress...');

    } else if (typeof infoText === 'string') {
        self._searchInProgress = false;
        this._$searchBox.prop('disabled', false);
        this._$info.text(infoText);
    }
};

Application.prototype.generateSearchUrl = function(obj) {
    var ret = "";
    if (obj['search']) {
        ret = "http://api.giphy.com/v1/gifs/search?q=" + encodeURIComponent(obj['search'])
    }

    ret += "&api_key=dc6zaTOxFJmzC ";
    return ret;
};

Application.prototype.startToSearch = function(sText) {
    var self = this;
    self.switchToSearchMode();

    $.ajax({
        url: self.generateSearchUrl({search: sText}),
        type: 'GET',
        contentType: 'application/json',
        success: function (data) {
            console.log(data);
            if(data && data['data']) {
                self.showResults(data['data'], data['pagination']);
            }
        },
        error: function (data) {
            self.switchToSearchMode('Problem while calling search API...');
        }
    });
};

Application.prototype.showResults = function(data, pagination) {
    if (data.length === 0) {
        this.switchToSearchMode("Search result doesn't contain any data...");
        this._$results.html("");
        return;
    }
    if (pagination) {
        if (pagination["count"] === pagination["total_count"]) {
            this.switchToSearchMode('Displaying ' + pagination["count"] + " results.");
        } else {
            this.switchToSearchMode('Displaying first ' + pagination["count"] + " from " + pagination["total_count"] + " results.");
        }
    };

    _.forEach(data, function(item){

        var $item = $('<div class="item"/>');

        var style = 'url("'+ item['images']['downsized']['url'] +'") no-repeat center center';
        $item.css('background', style);
        this._$results.append($item);

    }, this);
};