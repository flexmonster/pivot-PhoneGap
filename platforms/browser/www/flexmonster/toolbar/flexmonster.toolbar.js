/**
 * 	Toolbar for Flexmonster Pivot Table & Charts Component
 *	Version 2.3
 **/
var FlexmonsterToolbar = function (pivotContainer, pivot, _, width, labels, dataSourceType) {
    this.pivot = pivot;
    this.pivotContainer = pivotContainer;
    this.width = (typeof width == "number" || (width.indexOf("px") < 0 && width.indexOf("%") < 0)) ? width + "px" : width;
    this.Labels = labels;
    this.dataSourceType = dataSourceType || 5;
}
FlexmonsterToolbar.prototype.getTabs = function () {
    var tabs = [];
    var Labels = this.Labels;
    // Connect tab
    tabs.push({
        title: Labels.connect, id: "fm-tab-connect",
        menu: [
            { title: Labels.connect_local_csv, id: "fm-tab-connect-local-csv", handler: "connectLocalCSVHandler", mobile: false },
            { title: Labels.connect_local_json, id: "fm-tab-connect-local-json", handler: "connectLocalJSONHandler", mobile: false },
            { title: this.osUtils.isMobile ? Labels.connect_remote_csv_mobile : Labels.connect_remote_csv, id: "fm-tab-connect-remote-csv", handler: "connectRemoteCSV" },
            { title: this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.connect_olap, id: "fm-tab-connect-olap", handler: "connectOLAP", flat: false }
        ]
    });

    // Open tab
    tabs.push({
        title: Labels.open, id: "fm-tab-open",
        menu: [
            { title: Labels.local_report, id: "fm-tab-open-local-report", handler: "openLocalReport", mobile: false },
            { title: this.osUtils.isMobile ? Labels.remote_report_mobile : Labels.remote_report, id: "fm-tab-open-remote-report", handler: "openRemoteReport" }
        ]
    });

    // Save tab
    tabs.push({ title: Labels.save, id: "fm-tab-save", handler: "saveHandler", mobile: false });
    tabs.push({ divider: true });

    // Grid tab
    tabs.push({ title: Labels.grid, id: "fm-tab-grid", handler: "gridHandler" });

    // Charts tab
    tabs.push({
        title: Labels.charts, id: "fm-tab-charts", onShowHandler: "checkChartMultipleMeasures",
        menu: [
            { title: Labels.charts_bar, id: "fm-tab-charts-bar", handler: "chartsHandler", args: "bar" },
            { title: Labels.charts_bar_horizontal, id: "fm-tab-charts-bar-horizontal", handler: "chartsHandler", args: "bar_h" },
            { title: Labels.charts_line, id: "fm-tab-charts-line", handler: "chartsHandler", args: "line" },
            { title: Labels.charts_scatter, id: "fm-tab-charts-scatter", handler: "chartsHandler", args: "scatter" },
            { title: Labels.charts_pie, id: "fm-tab-charts-pie", handler: "chartsHandler", args: "pie" },
            { title: Labels.charts_bar_stack, id: "fm-tab-charts-bar-stack", handler: "chartsHandler", args: "bar_stack", flat: false },
            { title: Labels.charts_bar_line, id: "fm-tab-charts-bar-line", handler: "chartsHandler", args: "bar_line", flat: false },
            { divider: true, flat: false, mobile: false },
            { title: Labels.charts_multiple, id: "fm-tab-charts-multiple", handler: "chartsMultipleHandler", flat: false, mobile: false }
        ]
    });
    tabs.push({ divider: true });

    // Format tab
    tabs.push({
        title: Labels.format, id: "fm-tab-format",
        menu: [
            { title: this.osUtils.isMobile ? Labels.format_cells_mobile : Labels.format_cells, id: "fm-tab-format-cells", handler: "formatCellsHandler" },
            { title: this.osUtils.isMobile ? Labels.conditional_formatting_mobile : Labels.conditional_formatting, id: "fm-tab-format-conditional", handler: "conditionalFormattingHandler" }
        ]
    });

    // Options tab
    tabs.push({ title: Labels.options, id: "fm-tab-options", handler: "optionsHandler" });

    // Right-aligned tabs should go in reversed order due to float: right
    // Fullscreen tab
    if (document["addEventListener"] != undefined) { // For IE8
        tabs.push({ title: Labels.fullscreen, id: "fm-tab-fullscreen", handler: "fullscreenHandler", mobile: false });
    }

    // Export tab
    tabs.push({
        title: Labels.export, id: "fm-tab-export", mobile: false,
        menu: [
            { title: Labels.export_print, id: "fm-tab-export-print", handler: "printHandler" },
            { title: Labels.export_html, id: "fm-tab-export-html", handler: "exportHandler", args: "html" },
            { title: Labels.export_csv, id: "fm-tab-export-csv", handler: "exportHandler", args: "csv" },
            { title: Labels.export_excel, id: "fm-tab-export-excel", handler: "exportHandler", args: "excel" },
            { title: Labels.export_image, id: "fm-tab-export-image", handler: "exportHandler", args: "image" },
            { title: Labels.export_pdf, id: "fm-tab-export-pdf", handler: "exportHandler", args: "pdf" },
        ]
    });

    // Fields tab
    tabs.push({ title: Labels.fields, id: "fm-tab-fields", handler: "fieldsHandler" });

    return tabs;
}
FlexmonsterToolbar.prototype.create = function () {
    this.popupManager = FlexmonsterToolbar.PopupManager(this);
    this.dataProvider = this.getTabs();
    if (this.dataSourceType != 5) {
        this.filterConnectMenu();
    }
    this.init();
}
FlexmonsterToolbar.prototype.init = function () {
    this.container = this.pivotContainer;
    this.container.style.position = (this.container.style.position == "") ? "relative" : this.container.style.position;
    this.toolbarWrapper = document.createElement("div");
    this.toolbarWrapper.id = "fm-toolbar-wrapper";
    this.toolbarWrapper.style.width = this.width;
    if (this.osUtils.isMobile) {
        this.addClass(this.toolbarWrapper, "fm-mobile");
    }
    this.addClass(this.toolbarWrapper, "fm-toolbar-ui");
    this.toolbarWrapper.style.width = this.width;
    var toolbar = document.createElement("ul");
    toolbar.id = "fm-toolbar";
    for (var i = 0; i < this.dataProvider.length; i++) {
        if (this.isDisabled(this.dataProvider[i])) continue;
        if (this.osUtils.isMobile && this.dataProvider[i].menu != null && this.dataProvider[i].collapse != true) {
            for (var j = 0; j < this.dataProvider[i].menu.length; j++) {
                if (this.isDisabled(this.dataProvider[i].menu[j])) continue;
                toolbar.appendChild(this.createTab(this.dataProvider[i].menu[j]));
            }
        } else {
            toolbar.appendChild((this.dataProvider[i].divider) ? this.createDivider() : this.createTab(this.dataProvider[i]));
        }
    }
    this.toolbarWrapper.appendChild(toolbar);
    this.container.insertBefore(this.toolbarWrapper, this.container.firstChild);
    this.updateLabels(this.Labels);

    var toolbarWidth = this.toolbarWrapper.getBoundingClientRect().width;
    if (!isNaN(toolbarWidth) && toolbarWidth < 820) {
        this.addClass(this.toolbarWrapper, "fm-compact");
    }
}

 // LABELS
FlexmonsterToolbar.prototype.updateLabels = function (labels) {
    var Labels = this.Labels = labels;

    this.setText(document.querySelector("#fm-tab-connect > a > span"), Labels.connect);
    this.setText(document.querySelector("#fm-tab-connect-local-csv > a > span"), Labels.connect_local_csv);
    this.setText(document.querySelector("#fm-tab-connect-local-json > a > span"), Labels.connect_local_json);
    this.setText(document.querySelector("#fm-tab-connect-remote-csv > a > span"), this.osUtils.isMobile ? Labels.connect_remote_csv_mobile : Labels.connect_remote_csv);
    this.setText(document.querySelector("#fm-tab-connect-olap > a > span"), this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.connect_olap);

    this.setText(document.querySelector("#fm-tab-open > a > span"), Labels.open);
    this.setText(document.querySelector("#fm-tab-open-local-report > a > span"), Labels.local_report);
    this.setText(document.querySelector("#fm-tab-open-remote-report > a > span"), this.osUtils.isMobile ? Labels.remote_report_mobile : Labels.remote_report);

    this.setText(document.querySelector("#fm-tab-save > a > span"), Labels.save);

    this.setText(document.querySelector("#fm-tab-grid > a > span"), Labels.grid);

    this.setText(document.querySelector("#fm-tab-charts > a > span"), Labels.charts);
    this.setText(document.querySelector("#fm-tab-charts-bar > a > span"), Labels.charts_bar);
    this.setText(document.querySelector("#fm-tab-charts-line > a > span"), Labels.charts_line);
    this.setText(document.querySelector("#fm-tab-charts-scatter > a > span"), Labels.charts_scatter);
    this.setText(document.querySelector("#fm-tab-charts-pie > a > span"), Labels.charts_pie);
    this.setText(document.querySelector("#fm-tab-charts-bar-stack > a > span"), Labels.charts_bar_stack);
    this.setText(document.querySelector("#fm-tab-charts-bar-line > a > span"), Labels.charts_bar_line);
    this.setText(document.querySelector("#fm-tab-charts-multiple > a > span"), Labels.charts_multiple);

    this.setText(document.querySelector("#fm-tab-format > a > span"), Labels.format);
    this.setText(document.querySelector("#fm-tab-format-cells > a > span"), this.osUtils.isMobile ? Labels.format_cells_mobile : Labels.format_cells);
    this.setText(document.querySelector("#fm-tab-format-conditional > a > span"), this.osUtils.isMobile ? Labels.conditional_formatting_mobile : Labels.conditional_formatting);

    this.setText(document.querySelector("#fm-tab-options > a > span"), Labels.options);
    this.setText(document.querySelector("#fm-tab-fullscreen > a > span"), Labels.fullscreen);

    this.setText(document.querySelector("#fm-tab-export > a > span"), Labels.export);
    this.setText(document.querySelector("#fm-tab-export-print > a > span"), Labels.export_print);
    this.setText(document.querySelector("#fm-tab-export-html > a > span"), Labels.export_html);
    this.setText(document.querySelector("#fm-tab-export-csv > a > span"), Labels.export_csv);
    this.setText(document.querySelector("#fm-tab-export-excel > a > span"), Labels.export_excel);
    this.setText(document.querySelector("#fm-tab-export-image > a > span"), Labels.export_image);
    this.setText(document.querySelector("#fm-tab-export-pdf > a > span"), Labels.export_pdf);

    this.setText(document.querySelector("#fm-tab-fields > a > span"), Labels.fields);
}

// HANDLERS
// Connect tab
FlexmonsterToolbar.prototype.connectLocalCSVHandler = function() {
	this.pivot.connectTo({ dataSourceType: "csv", browseForFile: true });
}
FlexmonsterToolbar.prototype.connectLocalJSONHandler = function () {
    this.pivot.connectTo({ dataSourceType: "json", browseForFile: true });
}
FlexmonsterToolbar.prototype.connectRemoteCSV = function () {
    this.showConnectToRemoteCSVDialog();
}
FlexmonsterToolbar.prototype.connectOLAP = function () {
    this.showConnectToOLAPDialog();
}
// Open tab
FlexmonsterToolbar.prototype.openLocalReport = function () {
    this.pivot.open();
}
FlexmonsterToolbar.prototype.openRemoteReport = function () {
    this.showOpenRemoteReportDialog();
}
// Save tab
FlexmonsterToolbar.prototype.saveHandler = function () {
    this.pivot.save("report.json", 'file');
}
// Grid tab
FlexmonsterToolbar.prototype.gridHandler = function () {
    this.pivot.showGrid();
}
// Charts tab
FlexmonsterToolbar.prototype.chartsHandler = function (type) {
    var options = this.pivot.getOptions() || {};
    var chartOptions = options['chart'] || {};
    var multiple = chartOptions['multipleMeasures'];
    var node = document.getElementById("fm-tab-charts-multiple");
    if (node != null) this.disableMultipleValues(type, multiple, node);
    this.pivot.showCharts(type, multiple);
}
FlexmonsterToolbar.prototype.chartsMultipleHandler = function () {
    var options = this.pivot.getOptions() || {};
    var chartOptions = options['chart'] || {};
    var type = chartOptions['type'];
    var multiple = !chartOptions['multipleMeasures'];
    var node = document.getElementById("fm-tab-charts-multiple");
    multiple ? this.addClass(node, "fm-selected") : this.removeClass(node, "fm-selected");
    if (type == "pie" || type == "bar_stack" || type == "bar_line") {
        this.removeClass(node, "fm-selected");
    } else {
        this.pivot.showCharts(type, multiple);
    }
}
FlexmonsterToolbar.prototype.checkChartMultipleMeasures = function () {
    var options = this.pivot.getOptions() || {};
    var chartOptions = options['chart'] || {};
    var multiple = chartOptions['multipleMeasures'];
    var node = document.getElementById("fm-tab-charts-multiple");
    if (node != null) {
        this.disableMultipleValues(chartOptions['type'], multiple, node);
    }
}
FlexmonsterToolbar.prototype.disableMultipleValues = function (type, multiple, node) {
    var Labels = this.Labels;
    if (type == "pie" || type == "bar_stack" || type == "bar_line") {
        var chartType = "";
        switch (type) {
            case ("pie"):
                chartType = Labels.charts_pie;
                break;
            case ("bar_stack"):
                chartType = Labels.charts_bar_stack;
                break;
            case ("bar_line"):
                chartType = Labels.charts_bar_line;
                break;
        }
        this.removeClass(node, "fm-selected");
        this.addClass(node, "fm-multdisabled");
        isMultipleValDisabled = true;
        node.innerHTML = "<abbr title=\"" + Labels.charts_multiple_disabled + chartType.toLocaleLowerCase() + " " + Labels.charts.toLocaleLowerCase() + "\"> <a href=\"javascript:void(0)\"><span>" + Labels.charts_multiple + "</span></a></abbr>";
    } else if (multiple) {
        this.addClass(node, "fm-selected");
        this.removeClass(node, "fm-multdisabled");
        node.innerHTML = "<a href=\"javascript:void(0)\"><span>" + Labels.charts_multiple + "</span></a>";
        var _this = this;
        node.onclick = function () {
            _this.chartsMultipleHandler();
        }
    } else {
        this.removeClass(node, "fm-multdisabled");
        node.innerHTML = "<a href=\"javascript:void(0)\"><span>" + Labels.charts_multiple + "</span></a>";
        var _this = this;
        node.onclick = function () {
            _this.chartsMultipleHandler();
        }
    }
}
// Format tab
FlexmonsterToolbar.prototype.formatCellsHandler = function () {
    this.showFormatCellsDialog();
}
FlexmonsterToolbar.prototype.conditionalFormattingHandler = function () {
    this.showConditionalFormattingDialog();
}
// Options tab
FlexmonsterToolbar.prototype.optionsHandler = function () {
    this.showOptionsDialog();
}
// Fields tab
FlexmonsterToolbar.prototype.fieldsHandler = function () {
    this.pivot.openFieldsList();
}
// Export tab
FlexmonsterToolbar.prototype.printHandler = function () {
    this.pivot.print();
}
FlexmonsterToolbar.prototype.exportHandler = function (type) {
    (type == "pdf") ? this.showExportPdfDialog() : this.pivot.exportTo(type);
}
// Fullscreen tab
FlexmonsterToolbar.prototype.fullscreenHandler = function () {
    this.toggleFullscreen();
}

// DIALOGS
FlexmonsterToolbar.prototype.defaults = {};
// Connect to remote CSV
FlexmonsterToolbar.prototype.showConnectToRemoteCSVDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        if (textInput.value.length > 0) {
            self.pivot.connectTo({ filename: textInput.value, dataSourceType: "csv" });
        }
    }
    var dialog = this.popupManager.createPopup();
    dialog.setTitle(this.osUtils.isMobile ? Labels.csv : Labels.open_remote_csv);
    dialog.setToolbar([
        { id: "fm-btn-open", label: Labels.open, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("table");
    content.id = this.osUtils.isMobile ? "fm-remote-csv-mobile" : "fm-popup-remote-csv";
    content.className = "fm-form";

    var textInput = document.createElement("input");
    textInput.id = "fm-inp-file-url";
    textInput.type = "text";
    textInput.style.width = this.osUtils.isMobile ? "99%" : "320px";
    textInput.value = "http://cdn.flexmonster.com/2.3/data/data.csv";

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(textInput);
    tr.appendChild(td);
    content.appendChild(tr);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Connect to OLAP (XMLA)
FlexmonsterToolbar.prototype.showConnectToOLAPDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var onConnectBtnClick = function () {
        if (proxyUrlInput.value.length == 0) return;
        var credentialsCeckBox = document.getElementById("fm-credentials-checkbox");
        self.pivot.getXMLADataSources(proxyUrlInput.value,
            dataSourcesHandler,
            credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-username-input").value : null,
            credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-password-input").value : null);
    };
    var dataSourcesHandler = function (dataProvider) {
        if (dataProvider != null && dataProvider.length > 0) {
            fillList(olapDataSourcesList, dataProvider, Labels.select_data_source);
        }
    };
    var onOlapDataSourcesListChange = function () {
        var credentialsCeckBox = document.getElementById("fm-credentials-checkbox");
        self.pivot.getXMLACatalogs(proxyUrlInput.value,
            olapDataSourcesList.value,
            catalogsHandler,
            credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-username-input").value : null,
            credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-password-input").value : null);
    };
    var catalogsHandler = function (dataProvider) {
        if (dataProvider != null && dataProvider.length > 0) {
            fillList(olapCatalogsList, dataProvider, Labels.select_catalog);
        }
    };
    var onOlapCatalogsListChange = function () {
        var credentialsCeckBox = document.getElementById("fm-credentials-checkbox");
        self.pivot.getXMLACubes(proxyUrlInput.value, olapDataSourcesList.value, olapCatalogsList.value,
            cubesHandler,
            credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-username-input").value : null,
            credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-password-input").value : null);
    };
    var cubesHandler = function (dataProvider) {
        if (dataProvider != null && dataProvider.length > 0) {
            fillList(olapCubesList, dataProvider, Labels.select_cube);
        }
    };
    var onOlapCubesListChange = function () {
        self.removeClass(document.getElementById("fm-btn-open"), "fm-disabled");
    };
    var okHandler = function () {
        var provider = self.pivot.getXMLAProviderName(proxyUrlInput.value, '');
        var credentialsCeckBox = document.getElementById("fm-credentials-checkbox");
        self.pivot.connectTo({
            dataSourceType: provider,
            proxyUrl: proxyUrlInput.value,
            dataSourceInfo: olapDataSourcesList.value,
            catalog: olapCatalogsList.value,
            cube: olapCubesList.value,
            username: credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-username-input").value : null,
            password: credentialsCeckBox && credentialsCeckBox.checked ? document.getElementById("fm-password-input").value : null
        });
    };
    var fillList = function (list, dataProvider, prompt) {
        // clear
        var length = list.options.length;
        for (var i = 0; i < length; i++) {
            list.options[i] = null;
        }
        // fill
        list.options[0] = new Option(prompt, "");
        for (var i = 0; i < dataProvider.length; i++) {
            list.options[i + 1] = new Option(dataProvider[i], dataProvider[i]);
        }
        list.disabled = false;
        list.focus();
    };
    var onUseCredentialsChange = function () {
        var cbx = document.getElementById("fm-credentials-checkbox");
        var useCredentials = !self.hasClass(cbx, "fm-selected");
        if (useCredentials) {
            self.addClass(cbx, "fm-selected");
        } else {
            self.removeClass(cbx, "fm-selected");
        }
        document.getElementById("fm-credentials").style.display = useCredentials ? "inline" : "none";
    }

    var dialog = this.popupManager.createPopup();
    dialog.setTitle(this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.olap_connection_tool);
    dialog.setToolbar(this.osUtils.isMobile ? [
        { id: "fm-btn-open", label: Labels.open, handler: okHandler, disabled: true, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ] : [
        { id: "fm-btn-open", label: Labels.ok, handler: okHandler, disabled: true, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("table");
    content.id = this.osUtils.isMobile ? "fm-popup-connect-olap-mobile" : "fm-popup-connect-olap";
    content.className = "fm-form";

    var proxyInputLabel = document.createElement("tr");
    proxyInputLabel.innerHTML = '<th colspan="2">' + Labels.proxy_url + '</th>';
    content.appendChild(proxyInputLabel);

    proxyUrlInput = document.createElement("input");
    proxyUrlInput.id = "fm-inp-proxy-url";
    proxyUrlInput.type = "text";
    proxyUrlInput.className = "fm-half-input";
    proxyUrlInput.value = (this.dataSourceType == 3) ? "http://olap.flexmonster.com:8080/mondrian/xmla" : "http://olap.flexmonster.com/olap/msmdpump.dll";

    connectBtn = document.createElement("a");
    connectBtn.id = "fm-btn-connect";
    connectBtn.setAttribute("href", "javascript:void(0)");
    connectBtn.className = "fm-half-button";
    self.setText(connectBtn, Labels.connect);
    connectBtn.onclick = onConnectBtnClick;

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    td.appendChild(proxyUrlInput);
    td.appendChild(connectBtn);
    content.appendChild(tr);

    // ds info
    var dsListLabel = document.createElement("tr");
    dsListLabel.innerHTML = '<th colspan="2">' + Labels.data_source_info + '</th>';
    content.appendChild(dsListLabel);

    olapDataSourcesList = document.createElement("select");
    olapDataSourcesList.id = "fm-lst-dsinfo";
    olapDataSourcesList.disabled = true;
    olapDataSourcesList.innerHTML = '<option value="" class="placeholder" disabled selected>'
        + Labels.select_data_source + '</option>';
    olapDataSourcesList.onchange = onOlapDataSourcesListChange;

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    td.appendChild(olapDataSourcesList);
    content.appendChild(tr);

    var catalogsListLabel = document.createElement("tr");
    catalogsListLabel.innerHTML = '<th>' + Labels.catalog + '</th>';
    content.appendChild(catalogsListLabel);

    olapCatalogsList = document.createElement("select");
    olapCatalogsList.id = "fm-lst-catalogs";
    olapCatalogsList.disabled = true;
    olapCatalogsList.innerHTML = '<option value="" class="placeholder" disabled selected>'
        + Labels.select_catalog + '</option>';
    olapCatalogsList.onchange = onOlapCatalogsListChange;

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    td.appendChild(olapCatalogsList);
    content.appendChild(tr);

    var olapCubesLabel = document.createElement("tr");
    olapCubesLabel.innerHTML = '<th colspan="2">' + Labels.cube + '</th>';
    content.appendChild(olapCubesLabel);

    olapCubesList = document.createElement("select");
    olapCubesList.id = "fm-lst-cubes";
    olapCubesList.disabled = true;
    olapCubesList.innerHTML = '<option value="" class="placeholder" disabled selected>'
        + Labels.select_cube + '</option>';
    olapCubesList.onchange = onOlapCubesListChange;

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    td.appendChild(olapCubesList);
    content.appendChild(tr);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);

    if (document.getElementById("fm-credentials-checkbox") != null) {
        document.getElementById("fm-credentials-checkbox").onclick = onUseCredentialsChange;
    }
}
// Open remote report
FlexmonsterToolbar.prototype.showOpenRemoteReportDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        if (textInput.value.length > 0) {
            self.pivot.load(textInput.value);
        }
    }
    var dialog = this.popupManager.createPopup();
    dialog.setTitle(Labels.open_remote_report);
    dialog.setToolbar([
        { id: "fm-btn-open", label: Labels.open, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);
    var content = document.createElement("table");
    content.id = this.osUtils.isMobile ? "fm-remote-csv-mobile" : content.id;
    content.className = "fm-form";

    var textInput = document.createElement("input");
    textInput.type = "text";
    textInput.style.width = this.osUtils.isMobile ? "99%" : "320px";
    var options = self.pivot.getOptions() || {};
    var isFlatTable = (options.grid && options.grid.type == "flat");
    textInput.value = isFlatTable ? "http://cdn.flexmonster.com/2.3/reports/report-flat.json" : "http://cdn.flexmonster.com/2.3/reports/report.json";

    var tr = document.createElement("tr");
    var td = document.createElement("td");
    tr.appendChild(td);
    td.appendChild(textInput);
    content.appendChild(tr);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Format cells
FlexmonsterToolbar.prototype.showFormatCellsDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var valuesDropDownChangeHandler = function () {
        var formatVO = self.pivot.getFormat(valuesDropDown.value);
        textAlignDropDown.value = (formatVO.textAlign == "left" || formatVO.textAlign == "right") ? formatVO.textAlign : "right";
        thousandsSepDropDown.value = formatVO.thousandsSeparator;
        decimalSepDropDown.value = formatVO.decimalSeparator;
        decimalPlacesDropDown.value = formatVO.decimalPlaces;
        currencySymbInput.value = formatVO.currencySymbol;
        currencyAlignDropDown.value = formatVO.currencySymbolAlign;
        nullValueInput.value = formatVO.nullValue;
        isPercentDropdown.value = (formatVO.isPercent == true) ? true : false;
    }
    var applyHandler = function () {
        var formatVO = {};
        formatVO.textAlign = textAlignDropDown.value;
        formatVO.thousandsSeparator = thousandsSepDropDown.value;
        formatVO.decimalSeparator = decimalSepDropDown.value;
        formatVO.decimalPlaces = decimalPlacesDropDown.value;
        formatVO.currencySymbol = currencySymbInput.value;
        formatVO.currencySymbolAlign = currencyAlignDropDown.value;
        formatVO.nullValue = nullValueInput.value;
        formatVO.isPercent = isPercentDropdown.value == "true" ? true : false;
        self.pivot.setFormat(formatVO, valuesDropDown.value);
        self.pivot.refresh();
    }

    var dialog = this.popupManager.createPopup();
    dialog.setTitle(this.osUtils.isMobile ? Labels.format : Labels.format_cells);
    dialog.setToolbar(this.osUtils.isMobile ? [
        { id: "fm-btn-apply", label: Labels.done, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ] : [
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("table");
    content.id = this.osUtils.isMobile ? "fm-popup-format-cells-mobile" : "fm-popup-format-cells";
    content.className = "fm-form";

    var valuesDropDown = document.createElement("select");
    valuesDropDown.onchange = valuesDropDownChangeHandler;
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.value);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(valuesDropDown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var textAlignDropDown = document.createElement("select");
    textAlignDropDown.options[0] = new Option(Labels.align_left, "left");
    textAlignDropDown.options[1] = new Option(Labels.align_right, "right");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.text_align);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(textAlignDropDown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var thousandsSepDropDown = document.createElement("select");
    thousandsSepDropDown.options[0] = new Option(Labels.none, "");
    thousandsSepDropDown.options[1] = new Option(Labels.space, " ");
    thousandsSepDropDown.options[2] = new Option(",", ",");
    thousandsSepDropDown.options[3] = new Option(".", ".");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.thousand_separator);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(thousandsSepDropDown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var decimalSepDropDown = document.createElement("select");
    decimalSepDropDown.options[0] = new Option(".", ".");
    decimalSepDropDown.options[1] = new Option(",", ",");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.decimal_separator);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(decimalSepDropDown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var decimalPlacesDropDown = document.createElement("select");
    for (var i = 0; i < 11; i++) {
        decimalPlacesDropDown.options[i] = new Option(i === 0 ? Labels.none : (i - 1), i - 1);
    }
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.decimal_places);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(decimalPlacesDropDown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var currencySymbInput = document.createElement("input");
    currencySymbInput.type = "text";
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.currency_symbol);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(currencySymbInput);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var currencyAlignDropDown = document.createElement("select");
    currencyAlignDropDown.options[0] = new Option(Labels.align_left, "left");
    currencyAlignDropDown.options[1] = new Option(Labels.align_right, "right");
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.currency_align);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(currencyAlignDropDown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var nullValueInput = document.createElement("input");
    nullValueInput.type = "text";
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.null_value);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(nullValueInput);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    var isPercentDropdown = document.createElement("select");
    isPercentDropdown.options[0] = new Option(Labels.true_value, true);
    isPercentDropdown.options[1] = new Option(Labels.false_value, false);
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    var td = document.createElement("td");
    self.setText(this.osUtils.isMobile ? th : td, Labels.is_percent);
    tr.appendChild(this.osUtils.isMobile ? th : td);
    if (this.osUtils.isMobile) content.appendChild(tr);
    td = document.createElement("td");
    td.appendChild(isPercentDropdown);
    if (this.osUtils.isMobile) tr = document.createElement("tr");
    tr.appendChild(td);
    content.appendChild(tr);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);

    var measures = self.pivot.getMeasures();
    for (var i = 0; i < measures.length; i++) {
        valuesDropDown.options[i] = new Option(measures[i].caption, measures[i].uniqueName);
    }
    var cell = self.pivot.getSelectedCell();
    if (cell && cell.measure) {
        valuesDropDown.value = cell.measure.uniqueName;
    }
    valuesDropDownChangeHandler();
}
// Conditional formatting
FlexmonsterToolbar.prototype.showConditionalFormattingDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var conditions = this.pivot.getAllConditions();
    var applyHandler = function () {
        self.pivot.removeAllConditions();
        for (var i = 0; i < conditions.length; i++) {
            var formula = composeFormula(conditions[i].sign, conditions[i].value1, conditions[i].value2);
            if (formula == null) return;
            conditions[i].formula = formula;
            self.pivot.addCondition(conditions[i]);
        }
        self.pivot.refresh();
    };
    var onAddConditionBtnClick = function () {
        var condition = {
            isTotal: -1,
            sign: "<",
            value1: "0",
            measures: self.pivot.getMeasures(),
            trueStyle: { fontFamily: 'Arial', fontSize: 12, color: '#000000', backgroundColor: '#FFFFFF' }
        };
        conditions.push(condition);
        conditionsList.appendChild(self.createConditionalFormattingItem(condition, conditions));
    };
    var composeFormula = function (sign, value1, value2) {
        var formula = '';
        var firstValueEmpty = (value1 == null || value1.length == 0);
        var secondValueEmpty = (value2 == null || value2.length == 0);
        var isBetween = (sign === '><');
        if (firstValueEmpty || (isBetween && secondValueEmpty)) {
            return formula;
        }
        if (isBetween && !secondValueEmpty) {
            formula = "if(AND(#value > " + value1 + ", #value < " + value2 + "), 'trueStyle')";
        } else {
            var isString = isNaN(parseFloat(value1));
            if (isString) {
                value1 = "'" + value1 + "'";
            }
            formula = "if(#value " + sign + " " + value1 + ", 'trueStyle')";
        }
        return formula;
    };
    var parseStrings = function (input) {
        var output = [];
        var openQuote = false;
        var str = "";
        for (var i = 0; i < input.length; i++) {
            if (input[i] == '"' || input[i] == "'") {
                if (openQuote) {
                    output.push(str);
                } else {
                    str = "";
                }
                openQuote = !openQuote;
                continue;
            }
            if (openQuote) {
                str += input[i];
            }
        }
        return output;
    };
    var parseFormula = function (formula) {
        var parseNumber = /\W\d+\.*\d*/g;
        var parseSign = /<=|>=|<|>|=|=|!=/g;
        var numbers = formula.match(parseNumber);
        var strings = parseStrings(formula);
        var signs = formula.match(parseSign);
        if (numbers == null && strings == null) return {};
        return {
            value1: (numbers != null) ? numbers[0].replace(/\s/, '') : strings[0],
            value2: (numbers != null && numbers.length > 1) ? numbers[1].replace(/\s/, '') : '',
            sign: signs.join('')
        };
    };
    var parseStyles = function (input) {
        var output = {};
        var parts = input.split(";");
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].length == 0) continue;
            var keyValue = parts[i].split(":");
            output[normalizeName(keyValue[0])] = keyValue[1];
        }
        return output;
    };
    var normalizeName = function (input) {
        if (input == "font-family") return "fontFamily";
        if (input == "font-size") return "fontSize";
        if (input == "background-color") return "backgroundColor";
        return input;
    };
    var dialog = this.popupManager.createPopup();
    dialog.setTitle(this.osUtils.isMobile ? Labels.conditional : Labels.conditional_formatting);
    dialog.setToolbar(this.osUtils.isMobile ? [
        { id: "fm-btn-apply", label: Labels.done, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ] : [
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);
    var content = document.createElement("div");
    content.id = "fm-popup-conditional";

    var conditionsList = document.createElement("ul");
    if (this.osUtils.isMobile) content.style.marginBottom = "23px";
    conditionsList.id = this.osUtils.isMobile ? "fm-conditions-list-mobile" : "fm-conditions-list";
    content.appendChild(conditionsList);
    var addConditionDiv = document.createElement("div");
    var addConditionBtn = document.createElement("a");
    addConditionDiv.style.paddingTop = "21px";
    addConditionBtn.setAttribute("href", "javascript:void(0)");
    addConditionBtn.className = this.osUtils.isMobile ? "fm-link-button-mobile" : "fm-link-button";
    self.setText(addConditionBtn, Labels.add_condition);
    addConditionBtn.onclick = onAddConditionBtnClick;
    addConditionDiv.appendChild(addConditionBtn);
    content.appendChild(this.osUtils.isMobile ? addConditionDiv : addConditionBtn);

    for (var i = 0; i < conditions.length; i++) {
        var formula = parseFormula(conditions[i].formula);
        conditions[i].value1 = formula.value1;
        conditions[i].value2 = formula.value2;
        conditions[i].sign = formula.sign;
        conditions[i].measures = self.pivot.getMeasures();
        if (typeof conditions[i].trueStyle == "string") {
            conditions[i].trueStyle = parseStyles(conditions[i].trueStyle);
        }
        conditionsList.appendChild(self.createConditionalFormattingItem(conditions[i], conditions));
    }
    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
};
FlexmonsterToolbar.prototype.defaults.fontSizes = ["8px", "9px", "10px", "11px", "12px", "13px", "14px"],
FlexmonsterToolbar.prototype.defaults.fonts = ['Arial', 'Lucida Sans Unicode', 'Verdana', 'Courier New', 'Palatino Linotype', 'Tahoma', 'Impact', 'Trebuchet MS', 'Georgia', 'Times New Roman'],
FlexmonsterToolbar.prototype.defaults.conditions = [
    { label: "less_than", sign: '<' },
    { label: "less_than_or_equal", sign: '<=' },
    { label: "greater_than", sign: '>' },
    { label: "greater_than_or_equal", sign: '>=' },
    { label: "equal_to", sign: '=' },
    { label: "not_equal_to", sign: '!=' },
    { label: "between", sign: '><' }
];
FlexmonsterToolbar.prototype.createConditionalFormattingItem = function (data, allConditions) {
    self = this;
    var Labels = this.Labels;
    var fillValuesDropDown = function (measures, selectedMeasure) {
        valuesDropDown[0] = new Option(Labels.all_values, "");
        var options = self.pivot.getOptions() || {};
        var isFlatTable = (options.grid && options.grid.type == "flat");
        for (var i = 0; i < measures.length; i++) {
            if (isFlatTable && measures[i].type == 7) { // count measure
                continue;
            }
            valuesDropDown[valuesDropDown.options.length] = new Option(measures[i].caption, measures[i].uniqueName);
            // backward compatibility with 2.1
            if (selectedMeasure == "[Measures].[" + measures[i].uniqueName + "]") {
                selectedMeasure = measures[i].uniqueName;
            }
        }
        if (selectedMeasure != null) {
            valuesDropDown.value = selectedMeasure;
        } else {
            valuesDropDown.selectedIndex = 0;
        }
    };
    var fillConditionsDropDown = function (selectedCondition) {
        for (var i = 0; i < self.defaults.conditions.length; i++) {
            conditionsDropDown[i] = new Option(Labels[self.defaults.conditions[i].label], self.defaults.conditions[i].sign);
        }
        if (selectedCondition != null) {
            conditionsDropDown.value = selectedCondition;
        } else {
            conditionsDropDown.selectedIndex = 0;
        }
    };
    var fillFontFamiliesDropDown = function (selectedFont) {
        for (var i = 0; i < self.defaults.fonts.length; i++) {
            fontFamiliesDropDown[i] = new Option(self.defaults.fonts[i], self.defaults.fonts[i]);
        }
        fontFamiliesDropDown.value = (selectedFont == null ? 'Arial' : selectedFont);
    };
    var fillFontSizesDropDown = function (selectedFontSize) {
        for (var i = 0; i < self.defaults.fontSizes.length; i++) {
            fontSizesDropDown[i] = new Option(self.defaults.fontSizes[i], parseInt(self.defaults.fontSizes[i]));
        }
        if (selectedFontSize != null) {
            selectedFontSize = parseInt(selectedFontSize);// + "px";
        }
        fontSizesDropDown.value = (selectedFontSize == null ? 12 : selectedFontSize);
    };
    var onValueChanged = function () {
        data.measure = valuesDropDown.value;
    };
    var onFontFamilyChanged = function () {
        if (data.trueStyle != null) {
            data.trueStyle.fontFamily = fontFamiliesDropDown.value;
            drawSample();
        }
    };
    var onFontSizeChanged = function () {
        if (data.trueStyle != null) {
            data.trueStyle.fontSize = fontSizesDropDown.value;
            drawSample();
        }
    };
    var onConditionChanged = function () {
        data.sign = conditionsDropDown.value;
        if (('sign' in data) && data.sign === '><') {
            data.value2 = 0;
        } else {
            delete data.value2;
        }
        drawInputs();
    };
    var onInput1Changed = function () {
        data.value1 = (input1.value.length == 0) ? "0" : input1.value;
    };
    var onInput2Changed = function () {
        data.value2 = (input2.value.length == 0) ? "0" : input2.value;
    };
    var onRemoveBtnClick = function () {
        var idx = allConditions.indexOf(data);
        if (idx > -1) {
            allConditions.splice(idx, 1);
        }
        itemRenderer.parentNode.removeChild(itemRenderer);
    };
    var onTextColorChanged = function () {
        if (data.trueStyle != null) {
            data.trueStyle.color = textColorPicker.color.value;
            drawSample();
        }
    };
    var onBgColorChanged = function () {
        if (data.trueStyle != null) {
            data.trueStyle.backgroundColor = bgColorPicker.color.value;
            drawSample();
        }
    };
    var drawInputs = function () {
        if (('sign' in data) && data.sign === '><') {
            self.removeClass(input1, "fm-wide");
            input2.value = ('value2' in data ? data.value2 : "0");
            input2.style.display = "inline-block";
            andLabel.style.display = "inline-block";
        } else {
            self.addClass(input1, "fm-wide");
            input2.style.display = "none";
            andLabel.style.display = "none";
        }
    };
    var drawSample = function () {
        var trueStyle = data.trueStyle;
        if (trueStyle != null) {
            sample.style.backgroundColor = trueStyle.backgroundColor || '#fff';
            sample.style.color = trueStyle.color || '#000';
            sample.style.fontFamily = trueStyle.fontFamily || 'Arial';
            sample.style.fontSize = trueStyle.fontSize || '12px';
        }
    };

    var itemRenderer = document.createElement("li");
    var leftContainer = document.createElement("div");
    leftContainer.className = "fm-left-container";
    var firstRow = document.createElement("div");
    var secondRow = document.createElement("div");

    var valuesDropDown = document.createElement("select");
    valuesDropDown.id = "fm-values";
    if ('measures' in data) {
        fillValuesDropDown(data.measures, data.measure);
        valuesDropDown.disabled = (data.measures.length === 0);
    } else {
        valuesDropDown.disabled = true;
    }
    valuesDropDown.onchange = onValueChanged;
    firstRow.appendChild(valuesDropDown);

    var conditionsDropDown = document.createElement("select");
    conditionsDropDown.id = "fm-conditions";
    fillConditionsDropDown(!('sign' in data) ? null : data.sign);
    conditionsDropDown.onchange = onConditionChanged;
    firstRow.appendChild(conditionsDropDown);

    var input1 = document.createElement("input");
    input1.type = "number";
    input1.value = ('value1' in data ? data.value1 : "0");
    input1.onchange = onInput1Changed;
    firstRow.appendChild(input1);

    var andLabel = document.createElement("span");
    andLabel.id = "fm-and-label";
    self.setText(andLabel, this.osUtils.isMobile ? Labels.and_symbole : Labels.and);
    firstRow.appendChild(andLabel);

    var input2 = document.createElement("input");
    input2.type = "number";
    input2.value = ('value2' in data ? data.value2 : "0");
    input2.onchange = onInput2Changed;
    firstRow.appendChild(input2);

    drawInputs();

    var fontFamiliesDropDown = document.createElement("select");
    fontFamiliesDropDown.id = "fm-font-family";
    fillFontFamiliesDropDown((data.hasOwnProperty('trueStyle')) && (data.trueStyle.hasOwnProperty('fontFamily')) ? data.trueStyle.fontFamily : null);
    fontFamiliesDropDown.onchange = onFontFamilyChanged;
    secondRow.appendChild(fontFamiliesDropDown);

    var fontSizesDropDown = document.createElement("select");
    fontSizesDropDown.id = "fm-font-size";
    fillFontSizesDropDown((data.hasOwnProperty('trueStyle')) && (data.trueStyle.hasOwnProperty('fontSize')) ? data.trueStyle.fontSize : null);
    fontSizesDropDown.onchange = onFontSizeChanged;
    secondRow.appendChild(fontSizesDropDown);

    var textColorPicker = document.createElement("div");
    textColorPicker.className = this.osUtils.isMobile ? "fm-colorPicker-mobile" : "fm-colorPicker";
    textColorPicker.color = new FlexmonsterToolbar.ColorPicker.color(textColorPicker, this);
    textColorPicker.color.changeHandler = onTextColorChanged;
    textColorPicker.color.setValue((data.hasOwnProperty('trueStyle')) && (data.trueStyle.hasOwnProperty('color')) ? data.trueStyle.color : '0x000000');
    secondRow.appendChild(textColorPicker);

    var bgColorPicker = document.createElement("div");
    bgColorPicker.className = (this.osUtils.isMobile ? "fm-colorPicker-mobile" : "fm-colorPicker") + " fm-bgColorPicker";
    bgColorPicker.color = new FlexmonsterToolbar.ColorPicker.color(bgColorPicker, this);
    bgColorPicker.color.changeHandler = onBgColorChanged;
    bgColorPicker.color.setValue((data.hasOwnProperty('trueStyle')) && (data.trueStyle.hasOwnProperty('backgroundColor')) ? data.trueStyle.backgroundColor : '0xFFFFFF');
    secondRow.appendChild(bgColorPicker);

    var sample = document.createElement("div");
    sample.className = "fm-sample";
    if (this.osUtils.isMobile) {
        sample.style.height = "28px";
        sample.style.lineHeight = "28px";
        sample.style.width = "75px";
        sample.style.border = "1px solid #999";
    }
    self.setText(sample, "73.93");
    secondRow.appendChild(sample);
    drawSample();

    var labelThenDiv = document.createElement("div");
    labelThenDiv.style.fontWeight = "bold";
    labelThenDiv.style.marginBottom = "10px";
    var labelThen = document.createElement("label");
    self.setText(labelThen, Labels.then);
    labelThenDiv.appendChild(labelThen);

    leftContainer.appendChild(firstRow);
    if (this.osUtils.isMobile) leftContainer.appendChild(labelThenDiv);
    leftContainer.appendChild(secondRow);


    var labelIfDiv = document.createElement("div");
    labelIfDiv.style.marginBottom = "10px";
    labelIfDiv.style.textIndent = "15px";
    labelIfDiv.style.fontWeight = "bold";
    var labelIF = document.createElement("label");
    labelIfDiv.appendChild(labelIF);
    self.setText(labelIF, Labels.if);

    var removeDiv = document.createElement("div");
    removeDiv.style.marginBottom = "15px";
    var removeBtn = document.createElement("a");
    if (this.osUtils.isMobile) {
        self.setText(removeBtn, Labels.delete);
        removeBtn.style.position = "absolute";
        removeBtn.style.right = "34px";
    }
    removeBtn.className = this.osUtils.isMobile ? "fm-remove-condition-mobile" : "fm-remove-condition";
    removeBtn.onclick = onRemoveBtnClick;
    removeDiv.appendChild(removeBtn);

    if (this.osUtils.isMobile) {
        itemRenderer.appendChild(removeDiv);
        itemRenderer.appendChild(labelIfDiv);
        itemRenderer.appendChild(leftContainer);
    } else {
        itemRenderer.appendChild(leftContainer);
        itemRenderer.appendChild(removeBtn);

    }
    return itemRenderer;
};
// Options
FlexmonsterToolbar.prototype.showOptionsDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        var showGrandTotals;
        if (offRowsColsCbx.checked) {
            showGrandTotals = "off";
        } else if (onRowsColsCbx.checked) {
            showGrandTotals = "on";
        } else if (onRowsCbx.checked) {
            showGrandTotals = "rows";
        } else if (onColsCbx.checked) {
            showGrandTotals = "columns";
        }
        var showTotals;
        if (noSubTotalsCbx.checked) {
            showTotals = false;
        } else if (showSubTotalsCbx.checked) {
            showTotals = true;
        }
        var gridType = "compact";
        if (classicViewCbx && classicViewCbx.checked) {
            gridType = "classic";
        } else if (flatViewCbx && flatViewCbx.checked) {
            gridType = "flat";
        }

        var options = self.pivot.getOptions();
        var currentViewType = options["viewType"];
        var currentType = options["grid"]["type"];

        var options = {
            grid: {
                showGrandTotals: showGrandTotals,
                showTotals: showTotals,
                type: gridType
            }
        };
        options.viewType = (currentType != gridType && currentViewType == "charts") ? "grid" : currentViewType;

        self.pivot.setOptions(options);
        self.pivot.refresh();
    }
    var dialog = this.popupManager.createPopup();
    dialog.setTitle(this.osUtils.isMobile ? Labels.options : Labels.layout_options);
    dialog.setToolbar(this.osUtils.isMobile ? [
        { id: "fm-btn-apply", label: Labels.done, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }] : [
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
        ]);
    var grandTotalsForm = document.createElement("div");
    grandTotalsForm.className = "fm-form" + " fm-options-col" + " fm-options-span_1_of_2";
    var th = document.createElement("th");
    self.setText(th, Labels.grand_totals);
    grandTotalsForm.appendChild(th);

    var subTotalsForm = document.createElement("div");
    subTotalsForm.className = "fm-form" + " fm-options-col" + " fm-options-span_1_of_2";
    var th = document.createElement("th");
    self.setText(th, Labels.subtotals);
    subTotalsForm.appendChild(th);

    var layoutForm = document.createElement("div");
    layoutForm.className = "fm-form" + " fm-options-col" + " fm-options-span_1_of_2";
    var th = document.createElement("th");
    self.setText(th, Labels.layout);
    layoutForm.appendChild(th);

    var compactViewCbx = document.createElement("input");
    compactViewCbx.type = "radio";
    compactViewCbx.name = "layout";
    compactViewCbx.id = "compactViewCbx";
    compactViewCbx.value = "true";
    compactViewCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(compactViewCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "compactViewCbx");
    self.setText(label, Labels.compact_view);
    td.appendChild(label);
    tr.appendChild(td);
    layoutForm.appendChild(tr);

    var classicViewCbx = document.createElement("input");
    classicViewCbx.type = "radio";
    classicViewCbx.name = "layout";
    classicViewCbx.id = "classicViewCbx";
    classicViewCbx.value = "false";
    classicViewCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(classicViewCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "classicViewCbx");
    self.setText(label, Labels.classic_view);
    td.appendChild(label);
    tr.appendChild(td);
    layoutForm.appendChild(tr);

    var options = self.pivot.getReport();

    if (!(options["dataSource"]["dataSourceType"] == "microsoft analysis services"
        || options["dataSource"]["dataSourceType"] == "mondrian"
        || options["dataSource"]["dataSourceType"] == "iccube")) {
        var flatViewCbx = document.createElement("input");
        flatViewCbx.type = "radio";
        flatViewCbx.name = "layout";
        flatViewCbx.id = "flatViewCbx";
        flatViewCbx.value = "false";
        flatViewCbx.className = "fm-check-with-label";
        var tr = document.createElement("tr");
        var td = document.createElement("td");
        td.appendChild(flatViewCbx);
        var label = document.createElement("label");
        label.className = "fm-label-for-check";
        label.setAttribute("for", "flatViewCbx");
        self.setText(label, Labels.flat_view);
        td.appendChild(label);
        tr.appendChild(td);
        layoutForm.appendChild(tr);
    }


    var offRowsColsCbx = document.createElement("input");
    offRowsColsCbx.type = "radio";
    offRowsColsCbx.name = "grandTotals";
    offRowsColsCbx.id = "offRowsColsChBox";
    offRowsColsCbx.value = "off";
    offRowsColsCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(offRowsColsCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "offRowsColsChBox");
    self.setText(label, Labels.off_for_rows_and_columns);
    td.appendChild(label);
    tr.appendChild(td);
    grandTotalsForm.appendChild(tr);

    var onRowsColsCbx = document.createElement("input");
    onRowsColsCbx.type = "radio";
    onRowsColsCbx.name = "grandTotals";
    onRowsColsCbx.id = "onRowsColsChBox";
    onRowsColsCbx.value = "on";
    onRowsColsCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(onRowsColsCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "onRowsColsChBox");
    self.setText(label, Labels.on_for_rows_and_columns);
    td.appendChild(label);
    tr.appendChild(td);
    grandTotalsForm.appendChild(tr);

    var onRowsCbx = document.createElement("input");
    onRowsCbx.type = "radio";
    onRowsCbx.name = "grandTotals";
    onRowsCbx.id = "onRowsChBox";
    onRowsCbx.value = "rows";
    onRowsCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(onRowsCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "onRowsChBox");
    self.setText(label, Labels.on_for_rows);
    td.appendChild(label);
    tr.appendChild(td);
    grandTotalsForm.appendChild(tr);

    var onColsCbx = document.createElement("input");
    onColsCbx.type = "radio";
    onColsCbx.name = "grandTotals";
    onColsCbx.id = "onColsChBox";
    onColsCbx.value = "columns";
    onColsCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(onColsCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "onColsChBox");
    self.setText(label, Labels.on_for_columns);
    td.appendChild(label);
    tr.appendChild(td);
    grandTotalsForm.appendChild(tr);

    var noSubTotalsCbx = document.createElement("input");
    noSubTotalsCbx.type = "radio";
    noSubTotalsCbx.name = "subTotals";
    noSubTotalsCbx.id = "noSubtotalsChBox";
    noSubTotalsCbx.value = "false";
    noSubTotalsCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(noSubTotalsCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "noSubtotalsChBox");
    self.setText(label, Labels.do_not_show_subtotals);
    td.appendChild(label);
    tr.appendChild(td);
    subTotalsForm.appendChild(tr);

    var showSubTotalsCbx = document.createElement("input");
    showSubTotalsCbx.type = "radio";
    showSubTotalsCbx.name = "subTotals";
    showSubTotalsCbx.id = "allSubtotalsChBox";
    showSubTotalsCbx.value = "false";
    showSubTotalsCbx.className = "fm-check-with-label";
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(showSubTotalsCbx);
    var label = document.createElement("label");
    label.className = "fm-label-for-check";
    label.setAttribute("for", "allSubtotalsChBox");
    self.setText(label, Labels.show_all_subtotals);
    td.appendChild(label);
    tr.appendChild(td);
    subTotalsForm.appendChild(tr);

    var content = document.createElement("div");
    content.id = this.osUtils.isMobile ? "fm-popup-options-mobile" : "fm-popup-options";

    var optionsTableFirstRow = document.createElement("div");
    optionsTableFirstRow.className = "fm-form" + " fm-options-layout";
    optionsTableFirstRow.appendChild(grandTotalsForm);
    optionsTableFirstRow.appendChild(subTotalsForm);

    var optionsTableSecondRow = document.createElement("div");
    optionsTableSecondRow.className = "fm-form" + " fm-options-layout";
    optionsTableSecondRow.appendChild(layoutForm);

    content.appendChild(optionsTableFirstRow);
    content.appendChild(optionsTableSecondRow);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);

    var options = self.pivot.getOptions() || {};
    var optionsGrid = options.grid || {};

    if (optionsGrid.showGrandTotals == "off" || optionsGrid.showGrandTotals == false) {
        offRowsColsCbx.checked = true;
    } else if (optionsGrid.showGrandTotals == "on" || optionsGrid.showGrandTotals == true) {
        onRowsColsCbx.checked = true;
    } else if (optionsGrid.showGrandTotals == "rows") {
        onRowsCbx.checked = true;
    } else if (optionsGrid.showGrandTotals == "columns") {
        onColsCbx.checked = true;
    }

    if (optionsGrid.showTotals == false) {
        noSubTotalsCbx.checked = true;
    } else if (optionsGrid.showTotals == true) {
        showSubTotalsCbx.checked = true;
    }

    if (optionsGrid.type == "flat" && flatViewCbx) {
        flatViewCbx.checked = true;
    } else if (optionsGrid.type == "classic" && classicViewCbx) {
        classicViewCbx.checked = true;
    } else if (compactViewCbx) {
        compactViewCbx.checked = true;
    }
}
// Export to PDF
FlexmonsterToolbar.prototype.showExportPdfDialog = function () {
    var self = this;
    var Labels = this.Labels;
    var applyHandler = function () {
        var orientation = "portrait";
        if (landscapeRadio.checked) {
            orientation = "landscape";
        }
        self.pivot.exportTo('pdf', { pageOrientation: orientation });
    }
    var dialog = this.popupManager.createPopup();
    dialog.setTitle(Labels.choose_page_orientation);
    dialog.setToolbar([
        { id: "fm-btn-apply", label: Labels.apply, handler: applyHandler, isPositive: true },
        { id: "fm-btn-cancel", label: Labels.cancel }
    ]);

    var content = document.createElement("table");
    content.className = "fm-form";

    var portraitRadio = document.createElement("input");
    portraitRadio.id = "fm-portrait-radio";
    portraitRadio.type = "radio";
    portraitRadio.name = "pdfOrientation";
    portraitRadio.checked = true;
    var label = document.createElement("label");
    label.setAttribute("for", "fm-portrait-radio");
    self.setText(label, Labels.portrait);
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(portraitRadio);
    td.appendChild(label);
    tr.appendChild(td);
    content.appendChild(tr);

    var landscapeRadio = document.createElement("input");
    landscapeRadio.id = "fm-landscape-radio";
    landscapeRadio.type = "radio";
    landscapeRadio.name = "pdfOrientation";
    var label = document.createElement("label");
    label.setAttribute("for", "fm-landscape-radio");
    self.setText(label, Labels.landscape);
    var tr = document.createElement("tr");
    var td = document.createElement("td");
    td.appendChild(landscapeRadio);
    td.appendChild(label);
    tr.appendChild(td);
    content.appendChild(tr);

    dialog.setContent(content);
    this.popupManager.addPopup(dialog.content);
}
// Fullscreen
FlexmonsterToolbar.prototype.toggleFullscreen = function () {
    this.isFullscreen() ? this.exitFullscreen() : this.enterFullscreen(this.container);
}
FlexmonsterToolbar.prototype.isFullscreen = function () {
    return document.fullScreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
}
FlexmonsterToolbar.prototype.enterFullscreen = function (element) {
    if (element.requestFullscreen || element.webkitRequestFullScreen
        || element.mozRequestFullScreen || (element.msRequestFullscreen && window == top)) {
        this.containerStyle = {
            width: this.container.style.width,
            height: this.container.style.height,
            position: this.container.style.position,
            top: this.container.style.top,
            bottom: this.container.style.bottom,
            left: this.container.style.left,
            right: this.container.style.right
        };
        this.container.style.width = "100%";
        this.container.style.height = "100%";
        this.container.style.position = "fixed";
        this.container.style.top = 0 + "px";
        this.container.style.left = 0 + "px";

        this.toolbarWrapper.style.width = "100%";

    }
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullScreen) {
        var ua = navigator.userAgent;
        if ((ua.indexOf("Safari") > -1) && (ua.indexOf("Chrome") == -1)) {
            element.webkitRequestFullScreen();
        } else {
            element.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
        }
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) { //IE 11
        if (window == top) {
            element.msRequestFullscreen();
        } else {
            alert("Fullscreen mode in IE 11 is not currently supported while Pivot embeded in iframe.");
        }
    }
}
FlexmonsterToolbar.prototype.exitFullscreen = function () {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.cancelFullscreen) {
        document.cancelFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.webkitExitFullScreen) {
        document.webkitExitFullScreen();
    } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
    } else if (document.msExitFullscreen) { //IE 11
        document.msExitFullscreen();
    }
}
FlexmonsterToolbar.prototype.onFullscreenChange = function () {
    if (!this.isFullscreen()) {
        if (this.containerStyle) {
            this.container.style.width = this.containerStyle.width;
            this.container.style.height = this.containerStyle.height;
            this.container.style.position = this.containerStyle.position;
            this.container.style.top = this.containerStyle.top;
            this.container.style.bottom = this.containerStyle.bottom;
            this.container.style.left = this.containerStyle.left;
            this.container.style.right = this.containerStyle.right;
            this.toolbarWrapper.style.width = width;
            this.containerStyle = null;
        }
    }
}

// PRIVATE API
FlexmonsterToolbar.prototype.nullOrUndefined = function (val) {
    return (typeof (val) === 'undefined' || val === null);
}
FlexmonsterToolbar.prototype.hasClass = function (elem, cls) {
    return elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
}
FlexmonsterToolbar.prototype.addClass = function (elem, cls) {
    if (!this.hasClass(elem, cls)) {
        elem.className += " " + cls;
    }
}
FlexmonsterToolbar.prototype.removeClass = function (elem, cls) {
    if (this.hasClass(elem, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        elem.className = elem.className.replace(reg, ' ');
    }
}
FlexmonsterToolbar.prototype.setText = function (target, text) {
    if (!target) return;
    if (target.innerText !== undefined) {
        target.innerText = text;
    }
    if (target.textContent !== undefined) {
        target.textContent = text;
    }
}
FlexmonsterToolbar.prototype.createDivider = function () {
    var item = document.createElement("li");
    item.className = "fm-divider";
    return item;
}
FlexmonsterToolbar.prototype.createTab = function (data) {
    var tab = document.createElement("li");
    tab.id = data.id;
    var tabLink = document.createElement("a");
    tabLink.setAttribute("href", "javascript:void(0)");
    var title = document.createElement("span");
    this.setText(title, data.title);
    tabLink.appendChild(title);
    var _this = this;
    var _handler = typeof data.handler == "function" ? data.handler : this[data.handler];
    if (!this.nullOrUndefined(_handler)) {
        tabLink.onclick =
            function (handler, args) {
                return function () {
                    handler.call(_this, args);
                }
            }(_handler, data.args);
    }
    if (!this.nullOrUndefined(this[data.onShowHandler])) {
        tabLink.onmouseover =
            function (handler) {
                return function () {
                    handler.call(_this);
                }
            }(this[data.onShowHandler]);
    }
    tab.onmouseover = function () {
        _this.showDropdown(this);
    }
    tab.onmouseout = function () {
        _this.hideDropdown(this);
    }
    tab.appendChild(tabLink);
    if (data.menu != null && (!this.osUtils.isMobile || data.collapse == true)) {
        tab.appendChild(this.createTabMenu(data.menu));
    }
    return tab;
}
FlexmonsterToolbar.prototype.showDropdown = function (elem) {
    var menu = elem.querySelectorAll(".fm-dropdown")[0];
    if (menu) {
        menu.style.display = "block";
        if (menu.getBoundingClientRect().right > this.toolbarWrapper.getBoundingClientRect().right) {
            menu.style.right = 0;
            this.addClass(elem, "fm-align-rigth");
        }
    }
};
FlexmonsterToolbar.prototype.hideDropdown = function (elem) {
    var menu = elem.querySelectorAll(".fm-dropdown")[0];
    if (menu) {
        menu.style.display = "none";
        menu.style.right = null;
        this.removeClass(elem, "fm-align-rigth");
    }
};
FlexmonsterToolbar.prototype.createTabMenu = function (dataProvider) {
    var container = document.createElement("div");
    container.className = "fm-dropdown fm-shadow-container";
    var content = document.createElement("ul");
    content.className = "fm-dropdown-content";
    for (var i = 0; i < dataProvider.length; i++) {
        if (this.isDisabled(dataProvider[i])) continue;
        content.appendChild((dataProvider[i].divider) ? this.createMenuDivider() : this.createTab(dataProvider[i]));
    }
    container.appendChild(content);
    return container;
}
FlexmonsterToolbar.prototype.createMenuDivider = function () {
    var item = document.createElement("li");
    item.className = "fm-v-divider";
    return item;
}
FlexmonsterToolbar.prototype.isDisabled = function (data) {
    if (this.nullOrUndefined(data)) return true;
    return (data.ios === false && this.osUtils.isIOS) || (data.android === false && this.osUtils.isAndroid) || (data.mobile === false && this.osUtils.isMobile);
}
FlexmonsterToolbar.prototype.filterConnectMenu = function () {
    var menu = [];
    var Labels = this.Labels;
    if (this.dataSourceType == 1 || this.dataSourceType == 2) {
        menu.push({ title: Labels.connect_local_csv, id: "fm-tab-connect-local-csv", handler: "connectLocalCSVHandler", mobile: false });
        menu.push({ title: Labels.connect_local_json, id: "fm-tab-connect-local-json", handler: "connectLocalJSONHandler", mobile: false });
        menu.push({ title: this.osUtils.isMobile ? Labels.connect_remote_csv_mobile : Labels.connect_remote_csv, id: "fm-tab-connect-remote-csv", handler: "connectRemoteCSV" });
    } else if (this.dataSourceType == 3 || this.dataSourceType == 4) {
        menu.push({ title: this.osUtils.isMobile ? Labels.connect_olap_mobile : Labels.connect_olap, id: "fm-tab-connect-olap", handler: "connectOLAP", flat: false });
    }
    if (this.dataSourceType != 0 && this.dataProvider[0] && this.dataProvider[0].id == "fm-tab-connect") {
        this.dataProvider[0]["menu"] = menu;
    }
}

FlexmonsterToolbar.prototype.updateDataSourceType = function (dataType) {
    this.dataSourceType = dataType || 5;
    if (this.dataSourceType != 5 && this.dataProvider[0] && this.dataProvider[0].id == "fm-tab-connect") {
        this.filterConnectMenu();
        this.toolbarWrapper.firstChild.removeChild(this.toolbarWrapper.firstChild.firstChild);
        this.toolbarWrapper.firstChild.insertBefore(this.createTab(this.dataProvider[0]), this.toolbarWrapper.firstChild.firstChild);
    }
}
FlexmonsterToolbar.prototype.osUtils = {
    isIOS: navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.platform.match(/iPhone|iPad|iPod/i) ? true : false,
    isMac: /Mac/i.test(navigator.platform),
    isAndroid: navigator.userAgent.match(/Android/i) ? true : false,
    isBlackBerry: /BlackBerry/i.test(navigator.platform),
    isMobile: navigator.userAgent.match(/iPhone|iPad|iPod/i) || navigator.platform.match(/iPhone|iPad|iPod/i) || navigator.userAgent.match(/Android/i) || /BlackBerry/i.test(navigator.platform)
};
FlexmonsterToolbar.PopupManager = function (toolbar) {
    var _this = {
        activePopup: null,
        createPopup: function () {
            return FlexmonsterToolbar.prototype.osUtils.isMobile ? new PopupWindowMobile() : new PopupWindow();
        },
        addPopup: function (popup) {
            if (popup == null) return;
            this.removePopup();
            var modalOverlay = this.addModalOverlay();
            this.activePopup = popup;
            toolbar.toolbarWrapper.appendChild(popup);
            toolbar.toolbarWrapper.appendChild(modalOverlay);
            var containerRect = this.getBoundingRect(toolbar.container);
            var popupRect = this.getBoundingRect(popup);
            var toolbarRect = this.getBoundingRect(toolbar.toolbarWrapper);
            popup.style.zIndex = parseInt(modalOverlay.style.zIndex) + 1;
            modalOverlay.style.top = toolbarRect.height + "px";
            modalOverlay.style.height = containerRect.height - toolbarRect.height + "px";
            popup.style.left = (toolbarRect.width - popupRect.width) / 2 + "px";
            popup.style.top = FlexmonsterToolbar.prototype.osUtils.isMobile ? toolbarRect.height + "px" : (containerRect.height - popupRect.height) / 2 + "px";
        },
        removePopup: function (popup) {
            var popup = (popup || this.activePopup);
            if (popup != null) {
                toolbar.toolbarWrapper.removeChild(document.getElementById("fm-popUp-modal-overlay"));
                toolbar.toolbarWrapper.removeChild(popup);
                this.activePopup = null;
            }
        },
        getBoundingRect: function (target) {
            var rect = target.getBoundingClientRect();
            return {
                left: rect.left,
                right: rect.right,
                top: rect.top,
                bottom: rect.bottom,
                width: rect.width || target.clientWidth,
                height: rect.height || target.clientHeight
            };
        },
        addModalOverlay: function () {
            var modalOverlay = document.createElement("div");
            modalOverlay.className = "fm-modal-overlay";
            modalOverlay.id = "fm-popUp-modal-overlay";
            modalOverlay.addEventListener('click', function (e) {
                _this.removePopup(_this.activePopup);
            });
            return modalOverlay;
        }
    };
    function PopupWindowMobile() {
        var container = document.createElement("div");
        container.className = "fm-ui-container-mobile";
        var contentPanel = document.createElement("div");
        contentPanel.className = "fm-panel-content";
        var toolbar = document.createElement("div");
        toolbar.className = "fm-ui-toolbar-mobile";
        var titleLabel = document.createElement("span");
        titleLabel.className = "fm-ui-header-display";
        this.content = document.createElement("div");
        this.content.className = "fm-popup-mobile fm-border-conf";
        this.content.appendChild(container);
        container.appendChild(toolbar);
        toolbar.appendChild(titleLabel);
        container.appendChild(contentPanel);
        this.setTitle = function (title) {
            FlexmonsterToolbar.prototype.setText(titleLabel, title);
        }
        this.setContent = function (content) {
            contentPanel.appendChild(content);
        }
        this.setToolbar = function (buttons) {
            className = "fm-toolbar-ui fm-ui-btn fm-ui-mobile fm-header-btn ";
            for (var i = buttons.length - 1; i >= 0; i--) {
                var button = document.createElement("a");
                button.setAttribute("href", "javascript:void(0)");
                button.className = (i != 0) ? className + "fm-ui-left" : className + "fm-ui-right";
                if (buttons[i].id) button.id = buttons[i].id;
                FlexmonsterToolbar.prototype.setText(button, buttons[i].label);
                button.onclick =
                    function (handler) {
                        return function () {
                            if (handler != null) {
                                handler.call();
                            }
                            _this.removePopup();
                        }
                    }(buttons[i].handler);
                if (buttons[i].disabled === true) {
                    FlexmonsterToolbar.prototype.addClass(button, "fm-disabled");
                } else {
                    FlexmonsterToolbar.prototype.removeClass(button, "fm-disabled");
                }
                if (buttons[i].isPositive && (FlexmonsterToolbar.prototype.osUtils.isMac || FlexmonsterToolbar.prototype.osUtils.isIOS)) {
                    toolbar.insertBefore(button, toolbar.firstChild);
                } else {
                    toolbar.appendChild(button);
                }
            }
        }
        return this;
    }
    function PopupWindow() {
        var shadow = document.createElement("div");
        shadow.className = "fm-shadow-container";
        var contentPanel = document.createElement("div");
        contentPanel.className = "fm-panel-content";
        var titleBar = document.createElement("div");
        titleBar.className = "fm-title-bar";
        var titleLabel = document.createElement("div");
        titleLabel.className = "fm-title-text";
        var closeBtn = document.createElement("a");
        closeBtn.className = "fm-close-button";
        closeBtn.onclick = function () { _this.removePopup(); };
        var toolbar = document.createElement("div");
        toolbar.className = "fm-toolbox";
        toolbar.style.clear = "both";
        this.content = document.createElement("div");
        this.content.className = "fm-popup fm-panel fm-toolbar-ui";

        this.content.appendChild(shadow);
        shadow.appendChild(contentPanel);
        contentPanel.appendChild(titleBar);
        contentPanel.appendChild(toolbar);
        titleBar.appendChild(titleLabel);
        titleBar.appendChild(closeBtn);

        this.setTitle = function (title) {
            FlexmonsterToolbar.prototype.setText(titleLabel, title);
        }
        this.setContent = function (content) {
            contentPanel.insertBefore(content, toolbar)
        }
        this.setToolbar = function (buttons) {
            toolbar.innerHTML = "";
            for (var i = buttons.length - 1; i >= 0; i--) {
                var button = document.createElement("a");
                button.setAttribute("href", "javascript:void(0)");
                button.className = "fm-button";
                if (buttons[i].id) button.id = buttons[i].id;
                FlexmonsterToolbar.prototype.setText(button, buttons[i].label);
                button.onclick =
                    function (handler) {
                        return function () {
                            if (handler != null) {
                                handler.call();
                            }
                            _this.removePopup();
                        }
                    }(buttons[i].handler);
                if (buttons[i].disabled === true) {
                    FlexmonsterToolbar.prototype.addClass(button, "fm-disabled");
                } else {
                    FlexmonsterToolbar.prototype.removeClass(button, "fm-disabled");
                }
                if (buttons[i].isPositive && (FlexmonsterToolbar.prototype.osUtils.isMac || FlexmonsterToolbar.prototype.osUtils.isIOS)) {
                    toolbar.insertBefore(button, toolbar.firstChild);
                } else {
                    toolbar.appendChild(button);
                }
            }
            var clear = document.createElement("div");
            clear.className = "fm-clear";
            toolbar.appendChild(clear);
        }
        return this;
    }
    return _this;
}
FlexmonsterToolbar.ColorPicker = {
    bindClass: 'colorPicker',
    install: function () {
        FlexmonsterToolbar.ColorPicker.addEvent(window, 'load', FlexmonsterToolbar.ColorPicker.init);
    },
    init: function () {
        FlexmonsterToolbar.ColorPicker.bind();
    },
    bind: function () {
        var matchClass = new RegExp('(^|\\s)(' + FlexmonsterToolbar.ColorPicker.bindClass + ')\\s*(\\{[^}]*\\})?', 'i');
        var inputs = document.getElementsByTagName('input');
        for (var i = 0; i < inputs.length; i++) {
            if (!inputs[i].color && inputs[i].className && (inputs[i].className.match(matchClass))) {
                inputs[i].color = new FlexmonsterToolbar.ColorPicker.color(inputs[i]);
            }
        }
    },
    closePrevious: function () {
        if (FlexmonsterToolbar.ColorPicker.currentActive && FlexmonsterToolbar.ColorPicker.currentActive.closeBox) {
            FlexmonsterToolbar.ColorPicker.currentActive.closeBox();
        }
    },
    addEvent: function (el, evnt, func) {
        if (el.addEventListener) {
            el.addEventListener(evnt, func, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + evnt, func);
        }
    },
    stopEventPropagation: function (event) {
        event = event || window.event;
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
    },
    show: function (target, value) {
        target.style.display = value ? 'block' : 'none';
    },
    setBgColor: function (target, value) {
        if (FlexmonsterToolbar.ColorPicker.isColor(value)) {
            if (target.style.setAttribute) {
                target.style.setAttribute('backgroundColor', value);
            } else {
                target.style.backgroundColor = value;
            }
        }
    },
    isColor: function (value) {
        return value.match(/^#?[0-9A-Fa-f]{6}$/g);
    },
    getWhere: function (el, toolbar) {
        var curleft = 0;
        var curtop = 0;
        var curtopscroll = 0;
        var curleftscroll = 0;
        if (el.offsetParent) {
            curleft = el.offsetLeft;
            curtop = el.offsetTop;
            var elScroll = el;
            while (elScroll = elScroll.parentNode) {
                if (elScroll == toolbar.container) {
                    break;
                }
                curtopscroll = elScroll.scrollTop ? elScroll.scrollTop : 0;
                curleftscroll = 0;
                curleft -= curleftscroll;
                curtop -= curtopscroll;
            }
            while (el = el.offsetParent) {
                if (el == toolbar.container) {
                    break;
                }
                curleft += el.offsetLeft;
                curtop += el.offsetTop;
            }
        }
        var isMSIE = /*@cc_on!@*/ 0;
        var offsetX = 0;// isMSIE ? document.body.scrollLeft : window.pageXOffset;
        var offsetY = 0;// isMSIE ? document.body.scrollTop : window.pageYOffset;
        return {
            top: curtop + offsetY,
            left: curleft + offsetX
        };
    },
    color: function (target, toolbar) {
        var _this = this;
        this.colorPickerButton = target;
        this.dropDownBox = document.createElement('div');
        this.dropDownBox.className = FlexmonsterToolbar.prototype.osUtils.isMobile ? 'fm-swatchPanel-mobile' : 'fm-swatchPanel';
        this.dropDownBox.onclick = function (event) {
            FlexmonsterToolbar.ColorPicker.stopEventPropagation(event);
        };
        this.colorPreview = document.createElement('span');
        this.colorPreview.className = FlexmonsterToolbar.prototype.osUtils.isMobile ? 'fm-colorPreview-mobile' : 'fm-colorPreview';
        this.dropDownBox.appendChild(this.colorPreview); /* end */
        this.colorInput = document.createElement('input');
        this.colorInput.type = 'text';
        this.dropDownBox.appendChild(this.colorInput);
        this.colorInput.onclick = function (event) {
            FlexmonsterToolbar.ColorPicker.stopEventPropagation(event);
        };
        if (this.colorPickerButton.value == null || this.colorPickerButton.value.length == 0) {
            this.colorPickerButton.value = '#000000';
        }
        FlexmonsterToolbar.ColorPicker.addEvent(this.colorInput, 'keyup', function (event) {
            event = event || window.event;
            var dispatcher = event.target || event.srcElement;
            if (event.keyCode == 13) {
                _this.setValue(dispatcher.value);
                _this.closeBox();
            } else {
                onColorInputChanged(dispatcher.value);
            }
        });
        this.opened = false;
        this.openBox = function () {
            this.opened = true;
            var isMSIE = /*@cc_on!@*/ 0;
            var pos = FlexmonsterToolbar.ColorPicker.getWhere(this.colorPickerButton, toolbar);
            this.dropDownBox.style.top = pos.top + 26 + 'px';
            this.dropDownBox.style.left = pos.left + (isMSIE ? 0 : 1) + 'px';
            this.setValue(this.value);
            FlexmonsterToolbar.ColorPicker.show(this.dropDownBox, this.opened);
        }
        this.closeBox = function () {
            this.opened = false;
            FlexmonsterToolbar.ColorPicker.show(this.dropDownBox, false);
            if (this.changeHandler) {
                this.changeHandler();
            }
        }
        this.setValue = function (colorValue) {
            if (typeof colorValue === "string" && colorValue.indexOf("0x") == 0) {
                colorValue = "#" + colorValue.substr(2);
            }
            this.value = colorValue;
            this.colorInput.value = colorValue;
            FlexmonsterToolbar.ColorPicker.setBgColor(this.colorPreview, colorValue);
            FlexmonsterToolbar.ColorPicker.setBgColor(this.colorPickerButton, colorValue);
        }
        function composeRGB(r, g, b) {
            return '#' + r + g + b;
        }
        function onColorChanged(colorValue) {
            _this.setValue(colorValue);
            _this.closeBox();
        }
        function onColorCellHovered(colorValue) {
            _this.colorInput.value = colorValue;
            FlexmonsterToolbar.ColorPicker.setBgColor(_this.colorPreview, colorValue);
        }
        function onColorInputChanged(colorValue) {
            if (FlexmonsterToolbar.ColorPicker.isColor(colorValue)) _this.value = colorValue;
            FlexmonsterToolbar.ColorPicker.setBgColor(_this.colorPreview, colorValue);
        }
        this.createAndFillTable = function () {
            var grayscale = ["00", "00", "11", "22", "33", "44", "55", "66", "77", "88", "99", "AA", "BB", "CC", "DD", "EE", "FF", "FF"];
            var colors = ["00", "33", "66", "99", "CC", "FF"];
            this.colorsTable = document.createElement('table');
            var tbody = document.createElement('tbody');
            var tr = document.createElement('tr');
            var td;
            var div;
            var currentColor;
            for (var i = 0; i < 18; i++) {
                td = document.createElement('td');
                div = document.createElement('div');
                currentColor = composeRGB(grayscale[i], grayscale[i], grayscale[i]);
                FlexmonsterToolbar.ColorPicker.setBgColor(div, currentColor);
                FlexmonsterToolbar.ColorPicker.addEvent(div, 'click', function (colorValue) {
                    return function () {
                        onColorChanged(colorValue);
                    };
                }(currentColor));
                FlexmonsterToolbar.ColorPicker.addEvent(div, 'mouseover', function (colorValue) {
                    return function () {
                        onColorCellHovered(colorValue);
                    };
                }(currentColor));
                td.appendChild(div);
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
            for (var i = 0; i < 6; i++) {
                tr = document.createElement('tr');
                for (var j = 0; j < 3; j++)
                    for (var k = 0; k < 6; k++) {
                        div = document.createElement('div');
                        currentColor = composeRGB(colors[j], colors[i], colors[k]);
                        FlexmonsterToolbar.ColorPicker.setBgColor(div, currentColor);
                        FlexmonsterToolbar.ColorPicker.addEvent(div, 'click', function (colorValue) {
                            return function () {
                                onColorChanged(colorValue);
                            };
                        }(currentColor));
                        FlexmonsterToolbar.ColorPicker.addEvent(div, 'mouseover', function (colorValue) {
                            return function () {
                                onColorCellHovered(colorValue);
                            };
                        }(currentColor));
                        td = document.createElement('td');
                        td.appendChild(div);
                        tr.appendChild(td);
                    }
                tbody.appendChild(tr);
            }
            for (var i = 0; i < 6; i++) {
                tr = document.createElement('tr');
                for (var j = 3; j < 6; j++)
                    for (var k = 0; k < 6; k++) {
                        div = document.createElement('div');
                        currentColor = composeRGB(colors[j], colors[i], colors[k]);
                        FlexmonsterToolbar.ColorPicker.setBgColor(div, currentColor);
                        FlexmonsterToolbar.ColorPicker.addEvent(div, 'click', function (colorValue) {
                            return function () {
                                onColorChanged(colorValue);
                            };
                        }(currentColor));
                        FlexmonsterToolbar.ColorPicker.addEvent(div, 'mouseover', function (colorValue) {
                            return function () {
                                onColorCellHovered(colorValue);
                            };
                        }(currentColor));
                        td = document.createElement('td');
                        td.appendChild(div);
                        tr.appendChild(td);
                    }
                tbody.appendChild(tr);
            }
            this.colorsTable.appendChild(tbody);
            this.dropDownBox.appendChild(this.colorsTable);
            toolbar.toolbarWrapper.appendChild(this.dropDownBox);
        };
        this.createAndFillTable();
        this.setValue(this.colorPickerButton.value);
        FlexmonsterToolbar.ColorPicker.addEvent(this.colorPickerButton, 'click', function (event) {
            FlexmonsterToolbar.ColorPicker.stopEventPropagation(event);
            event = event || window.event;
            var target = event.target || event.srcElement;
            if (target && target.color && target.color.opened) {
                FlexmonsterToolbar.ColorPicker.currentActive = false;
                target.color.closeBox();
            } else {
                FlexmonsterToolbar.ColorPicker.closePrevious();
                FlexmonsterToolbar.ColorPicker.currentActive = target.color;
                target.color.openBox();
            };
        });
        FlexmonsterToolbar.ColorPicker.addEvent(document.body, 'click', function () {
            FlexmonsterToolbar.ColorPicker.closePrevious();
            FlexmonsterToolbar.ColorPicker.currentActive = false;
        });
    }
}