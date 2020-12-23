/*
 D3 Version4 only
*/
(function(global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.G4 = factory());
})(this, (function() { 'use static';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
		return typeof obj;
	} : function (obj) {
		return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	var CLASS = {
		chartArc: 'g4-chart-arc',
		chartOnText: 'g4-chart-onText',
		chartOnValue: 'g4-chart-onValue',
		chartLegends: 'g4-legends',
	};
	
	var CHART_TYPE = {
		pieChartEx: 'pieEx',
		barChartEx: 'barEx',
	};

	var isDefined = function isDefined(v) {
		return typeof v !== 'undefined';
	};

	var G4$1 = { version: "0.0.1" };

	var G4_chart_fn;
	var G4_chart_internal_fn;

	function Component(owner, componentKey, fn) {
		this.owner = owner;
		G4$1.chart.internal[componentKey] = fn;
	}

	function Chart(config) {
		var $$ = this.internal = new ChartInternal(this);
		var d3 = $$.d3;

		config.pie_value_format = d3.format(".0%");
		config.legend_percent_format = d3.format(".1%");
		$$.loadConfig(config);

		$$.beforeInit(config);
		$$.init();
		$$.afterInit(config);

		// bind "this" to nested API
		(function bindThis(fn, target, argThis) {
			Object.keys(fn).forEach(function (key) {
				target[key] = fn[key].bind(argThis);
				if (Object.keys(fn[key]).length > 0) {
					bindThis(fn[key], target[key], argThis);
				}
			});
		})(G4_chart_fn, this, this);
	}

	function ChartInternal(api) {
		var $$ = this;
		$$.d3 = window.d3 ? window.d3 : typeof require !== 'undefined' ? require("d3") : undefined;
		$$.api = api;
		$$.config = $$.getDefaultConfig();
		$$.data = {};
		//$$.cache = {};
		//$$.axes = {};
		console.log('D3 version:' + $$.d3.version)
	}

	G4$1.generate = function(config) {
		return new Chart(config);
	};

	G4$1.chart = {
		fn: Chart.prototype,
		internal: {
			fn: ChartInternal.prototype
		}
	};
	G4_chart_fn = G4$1.chart.fn;
	G4_chart_internal_fn = G4$1.chart.internal.fn;

	G4_chart_internal_fn.beforeInit = function () {
		//init前の処理
	};

	G4_chart_internal_fn.afterInit = function () {
		//init後の処理
	};

	G4_chart_internal_fn.init = function () {
		var $$ = this,
				 config = $$.config;

		$$.initParams();

		if (config.data_url) {
			//$$.convertUrlToData(config.data_url, config.data_mimeType, config.data_headers, config.data_keys, $$.initWithData);
		} else if (config.data_json) {
			//$$.initWithData($$.convertJsonToData(config.data_json, config.data_keys));
		} else if (config.data_rows) {
			//$$.initWithData($$.convertRowsToData(config.data_rows));
		} else if (config.data_columns) {
			//$$.initWithData($$.convertColumnsToData(config.data_columns));
		} else if (config.data_array) {
			$$.initWithData(config.data_array);
		} else {
			throw Error('url or json or rows or columns is required.');
		}
	};

	G4_chart_internal_fn.initParams = function () {
		var $$ = this,
				 d3 = $$.d3,
				 config = $$.config;

		//共通
		$$.chartContainerWidth = config.size_width;//グラフ描画領域の幅
		$$.chartContainerHeight = config.size_height;//グラフ描画領域の高さ

		//拡張PIEチャート用の設定
		$$.spacing = 0.5;
		$$.arcTextX = 5;//曲線テキストの始点ｘ
		$$.arcTextDY = 16;//曲線テキストのy軸からのずれさせる距離
		$$.valTextXOffset100percent = 38;
		$$.valTextXOffset = 32;
		$$.radius = Math.min($$.chartContainerWidth, $$.chartContainerHeight) * 0.68;//半径

	};

	G4_chart_internal_fn.initWithData = function (data) {
		var $$ = this,
			d3 = $$.d3,
			config = $$.config;
		var binding = true;

		if (!config.bindto) {
			$$.selectChart = d3.selectAll([]);
		} else if (typeof config.bindto.node === 'function') {
			$$.selectChart = config.bindto;
		} else {
			$$.selectChart = d3.select(config.bindto);
		}
		if ($$.selectChart.empty()) {
			binding = false;
		}
		$$.selectChart.html("");

		// Draw with targets
		if (binding) {
			if (config.chart_type == CHART_TYPE.pieChartEx) {
				//拡張円グラフ描画
				$$.orgChartData = config.data_array.slice();//orgChartDataは、凡例表示のみで使用
				if ($$.orgChartData.length > 0) {
					config.data_array = $$.orgChartData.slice(1);//index0以降が円グラフのデータ
					$$.orgChartData.move(0, $$.orgChartData.length - 1);//index0は、補助データなので最後の要素になるよう移動
				}
				$$.pieExChartDraw();
			}
			else if (config.chart_type == CHART_TYPE.barChartEx) {
				//拡張棒グラフ描画
			}
		}
	};

	G4_chart_internal_fn.getDefaultConfig = function () {
		var config = {
			bindto: '#chart',
			data_array: [],
			size_width: undefined,
			size_height: undefined,
			padding_left: undefined,
			padding_right: undefined,
			padding_top: undefined,
			padding_bottom: undefined,
			// color
			color_pattern: [
							'#B80117', '#222584', '#00904A', '#EDC600', '#261E1C',
							'#6D1782', '#8F253B', '#A0C238', '#D16B16', '#0168B3',
							'#B88B26', '#C30068',
			],
			// legend
			legend_bindto: '#legend',//つかってない
			legend_show: true,
			legend_percent_format: undefined,
			// type
			chart_type: undefined,
			// line
			// bar
			bar_width: undefined,
			bar_width_ratio: 0.6,
			bar_width_max: undefined,
			bar_zerobased: true,
			bar_space: 0,
			// pieEx
			pie_background_img: undefined,
			pie_caption_show: true,
			pie_caption_format: undefined,
			pie_value_show: true,
			pie_value_format: undefined,
			// title
			title_show: false,
			title_text: undefined,
			title_padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			},
			title_position: 'top-center'
		};

		Object.keys(this.additionalConfig).forEach(function (key) {
			config[key] = this.additionalConfig[key];
		}, this);

		return config;
	};
	G4_chart_internal_fn.additionalConfig = {};

	G4_chart_internal_fn.loadConfig = function (config) {
		var this_config = this.config,
			target,
			keys,
			read;
		function find() {
			//var key = keys.shift();
			var key = keys;
			//console.log("key =>", key, ", target =>", target);
			if (key && target && (typeof target === 'undefined' ? 'undefined' : _typeof(target)) === 'object' && key in target) {
				target = target[key];
				return find();
			} else if (!key) {
				return target;
			} else {
				return undefined;
			}
		}

		Object.keys(this_config).forEach(function (key) {
			target = config;
			//keys = key.split('_');
			//keys = key;
			//read = find();
			//console.log("CONFIG : ", key, read);
			//if (isDefined(read)) {
			//	this_config[key] = read;
			//}
			this_config[key] = target[key];
		});
	};

	G4_chart_internal_fn.pieExChartDraw = function() {
		var $$ = this,
			d3 = $$.d3,
			config = $$.config;

		$$.arc = d3.arc()
				.startAngle((-Math.PI * 3 / 4))//開始角度（-135°）
				.endAngle(function(d) {
					//終了角度（-135°(-3/2π)～135°(3/2π)）
					return (d.value * (Math.PI * 1.5) - Math.PI * 3 / 4);
				})
				.innerRadius(function(d) {
					//内径
					return (d.index - 0.1 + $$.spacing) * $$.radius;
				})
				.outerRadius(function(d) {
					//外径
					return (d.index + $$.spacing) * $$.radius;
				});

		//グラフSVGを作る
		$$.svg = $$.selectChart.append("svg")
				.attr("width", $$.chartContainerWidth)
				.attr("height", $$.chartContainerHeight)
				.append("g")
				.attr("transform", "translate(" + ($$.chartContainerWidth / 2) + "," + ($$.chartContainerHeight / 2) + ")");
		//背景画像
		$$.svg.append("svg:image")
				.attr("xlink:href", config.pie_background_img)
				.attr("x", -1 * $$.chartContainerWidth / 2)
				.attr("y", -1 * $$.chartContainerHeight / 2)
				.attr("width", $$.chartContainerWidth)
				.attr("height", $$.chartContainerHeight);
		$$.field = $$.svg.selectAll("g")
					.data(config.data_array)
					.enter().append("g");//データをもとに必要なgタグエレメントを作成する。
			//円グラフのパス
			$$.field.append("path")
				.attr("class", CLASS.chartArc)
				.attr("id", function(d, i) {
					return "pathID_" + i;
				});
			//値を表示するTEXTエレメント
			$$.field.append("text")
				.attr("id", function(d, i) {
					return "txtValue_" + i;
				})
				.attr("class", CLASS.chartOnValue)
				.append("textPath")//pathにidで関連付けするとパスの曲線に沿ってテキストを描画する。
				.attr("xlink:href", function(d, i) {
					return "#pathID_" + i;
				})
				.text(function(d) {
					return config.pie_value_show ? config.pie_value_format(d.value) : "";
				});
			//項目名を表示するTEXTエレメント
			$$.field.append("text")
				.attr("class", CLASS.chartOnText)
				.append("textPath")//pathにidで関連付けするとパスの曲線に沿ってテキストを描画する。
				.attr("xlink:href", function(d, i) {
					return "#pathID_" + i;
				})
				.text(function(d) {
					return config.pie_caption_show ? d.text : "";
				});

		//実際の描画処理をコールバック呼び出し。設定のインスタンスを引数で渡している。
		//durationにミリ秒を与えるとアニメーションする。
		d3.transition().duration(500).each($$.advancedSettingPieChart.bind(this, $$));
		d3.select(self.frameElement).style("height", $$.chartContainerHeight + "px");

		//凡例部分の描画、bindToを別のdivに設定すると、グラフとは別の領域に描画できるが、このソースでは行っていない。
		$$.svgLegend = $$.selectChart.append("svg")
				.attr("width", $$.chartContainerWidth)
				.attr("height", $$.chartContainerHeight)
				.attr("transform", "translate(" + ($$.chartContainerWidth / 2) + "," + ($$.chartContainerHeight / 2) + ")");
		$$.legend = $$.svgLegend.selectAll(".legends")
				.data($$.orgChartData)
				.enter().append("g")
				.attr("class", CLASS.chartLegends)
				.attr("transform", function(d, i) {
					return "translate(0, " + ((i * 20) + 10) + ")";
				});
			$$.legend.append("rect")//凡例マーク
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 20)
					.attr("height", 10)
					.style("fill", function(d, i) {
						return config.color_pattern[i];
					})
					.style("fill-opacity", function(d, i) {
						return (d.index == 0.0) ? 0 : 1;
					});
			$$.legend.append("text")  // 凡例の文言
					.attr("x", 30)
					.attr("y", 10)
					.text(function (d, i) {
						return d.text;
					})
					.attr("class", "textselected")
					.style("text-anchor", "start")
					.style("font-size", 16);
			$$.legend.append("text")  // 凡例の値
					.attr("x", 100)
					.attr("y", 10)
					.text(function (d, i) {
						return (d.index == 0.0) ? config.legend_percent_format(d.value) : (d.value*100) + " t";
					})
					.attr("class", "textselected")
					.style("text-anchor", "start")
					.style("font-size", 16);
	};

	G4_chart_internal_fn.advancedSettingPieChart = function(obj) {
		var $$ = obj,
			config = $$.config;

		$$.field = $$.field
				.each(function(d) {
					this._value = d.value;
				})
				.data(config.data_array)
				.each(function(d) {
					//console.log(this._value);
					d.previousValue = this._value;
				});

		$$.field.select("path")
			.transition()
			.attrTween("d", function(d) {
					var i = d3.interpolateNumber(0, d.value);
				return function(t) {
					d.value = i(t);
					return $$.arc(d);
				}
			})
			.style("opacity", function(d) {
				return 0.7;
			})
			.style("fill", function(d, i) {
				return config.color_pattern[i];
			});

		// 円グラフの終端に％値を表示する処理
		$$.field.select("." + CLASS.chartOnValue)
			.attr("x", function(d) {
				var x1 = 0.0;
				var theta = d.value * (Math.PI * 1.5);//中心角度(RAD)
				var outerRadius = (d.index + $$.spacing) * $$.radius;//外径
				if (d.value == 1.0) {
					// 100%では
					x1 = (outerRadius * theta) - $$.valTextXOffset100percent;//外径×中心角ラジアン－オフセット
				}
				else {
					//100%より小さい場合
					x1 = (outerRadius * theta) - $$.valTextXOffset;//外径×中心角ラジアン－オフセット
				}
				return x1;
			})
			.attr("dy", function(d) {
				var dy = 0.0;
				var outerRadius = (d.index + $$.spacing) * $$.radius;
				var innerRadius = (d.index - 0.1 + $$.spacing) * $$.radius;
				dy = ((outerRadius - innerRadius) / 2) + 5;//加算している5は、上方向にずれるので調整のために設定
				return dy;
			})
			.transition()
			.attr("transform", function(d) {
				return "rotate(0) " + "translate(0,0) " + "rotate(0)";
			});

		//円グラフのカーブに合わせてキャプションを表示する処理
		$$.field.select("." + CLASS.chartOnText)
			.attr("x", $$.arcTextX)
			.attr("dy", $$.arcTextDY)
			.transition()
			.attr("transform", function(d) {
				return "rotate(0) " + "translate(0,0) " + "rotate(0)";
			});
	};

	return G4$1;

}));

/*
 arrayのelementを指定されたindexと入れ替える
*/
Array.prototype.move = function(old_index, new_index) {
	while (old_index < 0) {
		old_index += this.length;
	}
	while (new_index < 0) {
		new_index += this.length;
	}
	if (new_index >= this.length) {
		var k = new_index - this.length;
		while ((k--) +1) {
			this.push(undefined);
		}
	}
	this.splice(new_index, 0, this.splice(old_index, 1)[0]);
	return this;
};
