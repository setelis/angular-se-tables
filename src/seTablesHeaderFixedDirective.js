angular.module("seTables.headerfixed", []).directive("seTablesHeaderFixed", function ($window) {
	"use strict";
	var ATTR_WIDTH = "se-tables-header-fixed-css-style";
	function saveStyle(element) {
		element.data(ATTR_WIDTH, element.attr("style"));
	}
	function revertStyle(element) {
		var newValue = element.data(ATTR_WIDTH);
		if (!newValue && newValue !== "") {
			element.removeAttr("style");
		} else {
			element.attr("style", element.data(ATTR_WIDTH));
		}
		element.removeData(ATTR_WIDTH);
	}
	return {
		restrict: "A",
		link: function(scope, element) {
			var $$window = $($window);
			var headTop;

			var handler = function() {
				function iterateOverElements(func) {
					var ths = element.find("th");
					func(ths);
					var tds = element.parent().find("tbody>tr:eq(0)>td");
					func(tds);
				}
				function removeWidth() {
					function removeDataAndSetWidth(elements) {
						_.forEach(elements, function(nextValue) {
							revertStyle($(nextValue));
						});
					}

					iterateOverElements(removeDataAndSetWidth);

					revertStyle(element);
				}
				function updateWidth() {
					function setCalculatedWidths(elements) {
						// if you change one width - other widths will be changed so we will get
						// calculated and then we will apply them
						var calculated = [];
						_.forEach(elements, function(nextValue) {
							var $nextValue = $(nextValue);
							saveStyle($nextValue);
							calculated.push($nextValue.width());
						});
						_.forEach(elements, function(nextValue) {
							$(nextValue).width(calculated.shift());
						});
					}
					iterateOverElements(setCalculatedWidths);

					saveStyle(element);
					element.width(element.width());
				}

				function shouldBeFixed() {
					function ensureHeaderTop() {
						if (angular.isUndefined(headTop)) {
							headTop = element.offset().top;
						}
						return headTop;
					}
					var scrollTop = $$window.scrollTop();
					return scrollTop > ensureHeaderTop();
				}
				function isFixed() {
					return element.hasClass("se-tables-header-fixed") && element.hasClass("se-tables-header-shadow");
				}
				if (shouldBeFixed() === isFixed()) {
					return;
				}

				if (shouldBeFixed()) {
					updateWidth();
					element.addClass("se-tables-header-fixed se-tables-header-shadow");
				} else {
					removeWidth();
					element.removeClass("se-tables-header-fixed se-tables-header-shadow");
				}
			};
			$$window.on("scroll", handler);
			scope.$on("$destroy", function() {
				$$window.off("scroll", handler);
			});
		}
	};
});
