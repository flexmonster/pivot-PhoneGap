/*
  Integration of FusionCharts with Flexmonster Pivot Table & Charts Component
  Copyright (c) 2016 Flexmonster.com
  Released under License
*/
(function() {
	FlexmonsterFusioncharts = {};

	FlexmonsterFusioncharts.getData = function(options, callbackHandler, updateHandler) {
		var type = options.type;
		var _options = {
			type: options.type
		}

		//define slice to select the data you would like to show (different from data that flexmonster instance is showing)
		//leave it undefined to get the data that flexmonster instance is showing
		var slice = options.slice;
		
		//in case FlexmonsterFusioncharts does not include the type of chart you need 
		//or you need to preprocess the data in a different way
		//please use prepareDataFunction
		var _prepareDataFunction = options.prepareDataFunction;
		
		var _updateHandler;
		if (updateHandler != null) {
			_updateHandler = function(data) {
				if (_prepareDataFunction != undefined) {
					updateHandler(_prepareDataFunction(data, _options), data);
				} else {
					updateHandler(prepareData(data, _options.type), data);
				}
			};
		}

		this.instance.getData({
				slice: slice
			}, function(data) { 
				if (_prepareDataFunction != undefined) {
					callbackHandler(_prepareDataFunction(data, _options), data);
				} else {
					callbackHandler(prepareData(data, _options.type), data);
				}
			}, _updateHandler
		);
	}
	
	FlexmonsterFusioncharts.getNumberFormat = function(fmt) {
		var format = {};
		if (fmt != null) {
			var thousandsSeparator = (fmt["thousandsSeparator"] != undefined && fmt["thousandsSeparator"] != "");
			if (thousandsSeparator) {
				format.thousandSeparator = fmt["thousandsSeparator"];
			}

			var decimalSeparator = (fmt["decimalSeparator"] != undefined && fmt["decimalSeparator"] != "");
			if (decimalSeparator) {
				format.decimalSeparator = fmt["decimalSeparator"];
			}

			var decimalPlaces = (fmt["decimalPlaces"] != undefined && fmt["decimalPlaces"] != -1);
			if (decimalPlaces) {
				format.decimals = fmt["decimalPlaces"];
				format.forceDecimals = "1";
			}

			var currencySymbol = fmt["currencySymbol"] != undefined && fmt["currencySymbol"] != "";
			if (currencySymbol) {
				if (fmt["currencySymbolAlign"] == "left") {
					format.numberPrefix = fmt["currencySymbol"];
				} else if (fmt["currencySymbolAlign"] == "right") {
					format.numberSuffix = fmt["currencySymbol"];
				}
			}
		}
		return format;
	}

	function prepareData(data, type) {
		switch (type) {
			case "column2d":
			case "column3d":
			case "line":
			case "area2d":
			case "bar2d":
			case "bar3d":
			case "pie2d":
			case "pie3d":
			case "doughnut2d":
			case "doughnut3d":
			case "pareto2d":
			case "pareto3d":
			case "spline":
			case "splinearea":
				return prepareSingleSeriesChart(data, type);
			case "mscolumn2d":
			case "mscolumn3d":
			case "mscolumn3dlinedy":
			case "msline":
			case "msbar2d":
			case "msbar3d":
			case "msarea":
			case "marimekko":
			case "stackedcolumn2d":
			case "stackedcolumn3d":
			case "stackedbar2d":
			case "stackedbar2d":
			case "stackedarea2d":
			case "msspline":
			case "mssplinearea":
			case "radar":
				return prepareMultiSeriesChart(data, type);
			case "maps/worldwithcountries":
				return prepareMap(data, type);
			default:
				return data;
		}
	}
	
	function prepareSingleSeriesChart(data, type) {
		var output = prepareChartInfo(data, type);
		output.data = [];
		for (var i = 0; i < data.data.length; i++) {
			var elem = {};
			var record = data.data[i];
			if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined || record["v0"] == undefined) continue;
				elem["label"] = record["r0"];
				elem["value"] = record["v0"];
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined || record["v0"] == undefined) continue;
				elem["label"] = record["c0"];
				elem["value"] = record["v0"];
			} else {
				if (record["v0"] == undefined) continue;
				elem["value"] = record["v0"];
			}
			output.data.push(elem);
		}
		return output;
	}
	
	function prepareMultiSeriesChart(data, type) {
		var output = prepareChartInfo(data, type);
		
		output.categories = [];
		output.dataset = [];
		var categories = {};
		var series = {};
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0 && data.meta["cAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["v0"] == undefined) continue;
				if (categories[record["r0"]] == undefined) categories[record["r0"]] = {"label": record["r0"]};
				if (record["c0"] == undefined || record["c1"] != undefined) continue;
				if (series[record["c0"]] == undefined) series[record["c0"]] = [];
				series[record["c0"]].push({"value": [record["v0"]]});
			} else if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["v0"] == undefined) continue;
				if (categories[record["r0"]] == undefined) categories[record["r0"]] = {"label": record["r0"]};
				if (series[""] == undefined) series[""] = [];
				series[""].push({"value": [record["v0"]]});
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["v0"] == undefined) continue;
				if (categories[record["c0"]] == undefined) categories[record["c0"]] = {"label": record["c0"]};
				if (series[""] == undefined) series[""] = [];
				series[""].push({"value": [record["v0"]]});
			}
		}
		
		var cats = [];
		for (var category in categories) {
			cats.push(categories[category]);
		}
		output.categories.push({"category": cats});
		for (var seriesname in series) {
			output.dataset.push({"seriesname": seriesname, "data": series[seriesname]});
		}
		
		return output;
	}
	
	function prepareChartInfo(data, type) {
		var output = {
			chart: {}
		};
		output.chart.caption = data.meta.caption;
		
		//number formatting
		var format = FlexmonsterFusioncharts.getNumberFormat(data.meta.formats[0]);
		for (var prop in format) {
			output.chart[prop] = format[prop];
		}
		//for the 2nd y axis
		if (data.meta.formats.length > 1) {
			var format2 = FlexmonsterFusioncharts.getNumberFormat(data.meta.formats[1]);
			for (var prop in format2) {
				output.chart["s"+prop] = format2[prop];
			}
		}
		
		switch (type) {
			case "pie2d":
			case "pie3d":
			case "doughnut2d":
			case "doughnut3d":
			case "radar":
				break;
			case "pareto2d":
			case "pareto3d":
				output.chart.pYAxisName = data.meta.v0Name;
				break;
			default:
				output.chart.xAxisName = (data.meta.r0Name != undefined) ? data.meta.r0Name : ((data.meta.c0Name != undefined) ? data.meta.c0Name : "");
				output.chart.yAxisName = data.meta.v0Name;
		}
		return output;
	}
	
	function prepareMap(data, type) {
		var output = prepareMapInfo(data, type);
		
		output.data = [];
		var minValue;
		var maxValue;
		for (var i = 0; i < data.data.length; i++) {
			var record = data.data[i];
			if (data.meta["rAmount"] > 0) {
				if (record["r0"] == undefined || record["r1"] != undefined || record["c0"] != undefined || record["v0"] == undefined) continue;
				output.data.push({
					"id": toMapID(record["r0"]),
					"value": record["v0"]
				});
				minValue = (minValue == undefined || record["v0"] < minValue) ? record["v0"] : minValue;
				maxValue = (maxValue == undefined || record["v0"] > maxValue) ? record["v0"] : maxValue;
			} else if (data.meta["cAmount"] > 0) {
				if (record["c0"] == undefined || record["c1"] != undefined || record["r0"] != undefined || record["v0"] == undefined) continue;
				output.data.push({
					"id": toMapID(record["c0"]),
					"value": record["v0"]
				});
				minValue = (minValue == undefined || record["v0"] < minValue) ? record["v0"] : minValue;
				maxValue = (maxValue == undefined || record["v0"] > maxValue) ? record["v0"] : maxValue;
			}
		}
		
		output.extradata = {
			"minValue": minValue,
			"maxValue": maxValue
		};
		
		return output;
	}
	
	function prepareMapInfo(data, type) {
		var output = {
			chart: {}
		};
		output.chart.caption = data.meta.caption;
		//number formatting
		var format = FlexmonsterFusioncharts.getNumberFormat(data.meta.formats[0]);
		for (var prop in format) {
			output.chart[prop] = format[prop];
		}
		return output;
	}
	
	function toMapID(label) {
		var countries = {
			"Australia": "175",
			"Canada": "05",
			"France": "141",
			"Germany": "142",
			"United Kingdom": "170",
			"United States": "23"
		};
		return (countries[label] != undefined) ? countries[label] : "";
	}
	
})();