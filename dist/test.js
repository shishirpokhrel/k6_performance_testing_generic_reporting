var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// ../k6-html-reporter/src/k6-summary.js
var require_k6_summary = __commonJS({
  "../k6-html-reporter/src/k6-summary.js"(exports2) {
    var forEach = function(obj, callback) {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          if (callback(key, obj[key])) {
            break;
          }
        }
      }
    };
    var palette = {
      bold: 1,
      faint: 2,
      red: 31,
      green: 32,
      cyan: 36
      //TODO: add others?
    };
    var groupPrefix = "\u2588";
    var detailsPrefix = "\u21B3";
    var succMark = "\u2713";
    var failMark = "\u2717";
    var defaultOptions = {
      indent: " ",
      enableColors: true,
      summaryTimeUnit: null,
      summaryTrendStats: null
    };
    function strWidth(s) {
      var data = s.normalize("NFKC");
      var inEscSeq = false;
      var inLongEscSeq = false;
      var width = 0;
      for (var char of data) {
        if (char.done) {
          break;
        }
        if (char == "\x1B") {
          inEscSeq = true;
          continue;
        }
        if (inEscSeq && char == "[") {
          inLongEscSeq = true;
          continue;
        }
        if (inEscSeq && inLongEscSeq && char.charCodeAt(0) >= 64 && char.charCodeAt(0) <= 126) {
          inEscSeq = false;
          inLongEscSeq = false;
          continue;
        }
        if (inEscSeq && !inLongEscSeq && char.charCodeAt(0) >= 64 && char.charCodeAt(0) <= 95) {
          inEscSeq = false;
          continue;
        }
        if (!inEscSeq && !inLongEscSeq) {
          width++;
        }
      }
      return width;
    }
    function summarizeCheck(indent, check2, decorate) {
      if (check2.fails == 0) {
        return decorate(indent + succMark + " " + check2.name, palette.green);
      }
      var succPercent = Math.floor(100 * check2.passes / (check2.passes + check2.fails));
      return decorate(
        indent + failMark + " " + check2.name + "\n" + indent + " " + detailsPrefix + "  " + succPercent + "% \u2014 " + succMark + " " + check2.passes + " / " + failMark + " " + check2.fails,
        palette.red
      );
    }
    function summarizeGroup(indent, group, decorate) {
      var result = [];
      if (group.name != "") {
        result.push(indent + groupPrefix + " " + group.name + "\n");
        indent = indent + "  ";
      }
      for (var i = 0; i < group.checks.length; i++) {
        result.push(summarizeCheck(indent, group.checks[i], decorate));
      }
      if (group.checks.length > 0) {
        result.push("");
      }
      for (var i = 0; i < group.groups.length; i++) {
        Array.prototype.push.apply(result, summarizeGroup(indent, group.groups[i], decorate));
      }
      return result;
    }
    function displayNameForMetric(name) {
      var subMetricPos = name.indexOf("{");
      if (subMetricPos >= 0) {
        return "{ " + name.substring(subMetricPos + 1, name.length - 1) + " }";
      }
      return name;
    }
    function indentForMetric(name) {
      if (name.indexOf("{") >= 0) {
        return "  ";
      }
      return "";
    }
    function humanizeBytes(bytes) {
      var units = ["B", "kB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
      var base = 1e3;
      if (bytes < 10) {
        return bytes + " B";
      }
      var e = Math.floor(Math.log(bytes) / Math.log(base));
      var suffix = units[e | 0];
      var val = Math.floor(bytes / Math.pow(base, e) * 10 + 0.5) / 10;
      return val.toFixed(val < 10 ? 1 : 0) + " " + suffix;
    }
    var unitMap = {
      s: { unit: "s", coef: 1e-3 },
      ms: { unit: "ms", coef: 1 },
      us: { unit: "\xB5s", coef: 1e3 }
    };
    function toFixedNoTrailingZeros(val, prec) {
      return parseFloat(val.toFixed(prec)).toString();
    }
    function toFixedNoTrailingZerosTrunc(val, prec) {
      var mult = Math.pow(10, prec);
      return toFixedNoTrailingZeros(Math.trunc(mult * val) / mult, prec);
    }
    function humanizeGenericDuration(dur) {
      if (dur === 0) {
        return "0s";
      }
      if (dur < 1e-3) {
        return Math.trunc(dur * 1e6) + "ns";
      }
      if (dur < 1) {
        return toFixedNoTrailingZerosTrunc(dur * 1e3, 2) + "\xB5s";
      }
      if (dur < 1e3) {
        return toFixedNoTrailingZerosTrunc(dur, 2) + "ms";
      }
      var result = toFixedNoTrailingZerosTrunc(dur % 6e4 / 1e3, dur > 6e4 ? 0 : 2) + "s";
      var rem = Math.trunc(dur / 6e4);
      if (rem < 1) {
        return result;
      }
      result = rem % 60 + "m" + result;
      rem = Math.trunc(rem / 60);
      if (rem < 1) {
        return result;
      }
      return rem + "h" + result;
    }
    function humanizeDuration(dur, timeUnit) {
      if (timeUnit !== "" && unitMap.hasOwnProperty(timeUnit)) {
        return (dur * unitMap[timeUnit].coef).toFixed(2) + unitMap[timeUnit].unit;
      }
      return humanizeGenericDuration(dur);
    }
    function humanizeValue(val, metric, timeUnit) {
      if (metric.type == "rate") {
        return (Math.trunc(val * 100 * 100) / 100).toFixed(2) + "%";
      }
      switch (metric.contains) {
        case "data":
          return humanizeBytes(val);
        case "time":
          return humanizeDuration(val, timeUnit);
        default:
          return toFixedNoTrailingZeros(val, 6);
      }
    }
    function nonTrendMetricValueForSum(metric, timeUnit) {
      switch (metric.type) {
        case "counter":
          return [
            humanizeValue(metric.values.count, metric, timeUnit),
            humanizeValue(metric.values.rate, metric, timeUnit) + "/s"
          ];
        case "gauge":
          return [
            humanizeValue(metric.values.value, metric, timeUnit),
            "min=" + humanizeValue(metric.values.min, metric, timeUnit),
            "max=" + humanizeValue(metric.values.max, metric, timeUnit)
          ];
        case "rate":
          return [
            humanizeValue(metric.values.rate, metric, timeUnit),
            succMark + " " + metric.values.passes,
            failMark + " " + metric.values.fails
          ];
        default:
          return ["[no data]"];
      }
    }
    function summarizeMetrics(options2, data, decorate) {
      var indent = options2.indent + "  ";
      var result = [];
      var names = [];
      var nameLenMax = 0;
      var nonTrendValues = {};
      var nonTrendValueMaxLen = 0;
      var nonTrendExtras = {};
      var nonTrendExtraMaxLens = [0, 0];
      var trendCols = {};
      var numTrendColumns = options2.summaryTrendStats.length;
      var trendColMaxLens = new Array(numTrendColumns).fill(0);
      forEach(data.metrics, function(name2, metric2) {
        names.push(name2);
        var displayName = indentForMetric(name2) + displayNameForMetric(name2);
        var displayNameWidth = strWidth(displayName);
        if (displayNameWidth > nameLenMax) {
          nameLenMax = displayNameWidth;
        }
        if (metric2.type == "trend") {
          var cols = [];
          for (var i = 0; i < numTrendColumns; i++) {
            var tc = options2.summaryTrendStats[i];
            var value = metric2.values[tc];
            if (tc === "count") {
              value = value.toString();
            } else {
              value = humanizeValue(value, metric2, options2.summaryTimeUnit);
            }
            var valLen = strWidth(value);
            if (valLen > trendColMaxLens[i]) {
              trendColMaxLens[i] = valLen;
            }
            cols[i] = value;
          }
          trendCols[name2] = cols;
          return;
        }
        var values = nonTrendMetricValueForSum(metric2, options2.summaryTimeUnit);
        nonTrendValues[name2] = values[0];
        var valueLen = strWidth(values[0]);
        if (valueLen > nonTrendValueMaxLen) {
          nonTrendValueMaxLen = valueLen;
        }
        nonTrendExtras[name2] = values.slice(1);
        for (var i = 1; i < values.length; i++) {
          var extraLen = strWidth(values[i]);
          if (extraLen > nonTrendExtraMaxLens[i - 1]) {
            nonTrendExtraMaxLens[i - 1] = extraLen;
          }
        }
      });
      names.sort();
      var getData = function(name2) {
        if (trendCols.hasOwnProperty(name2)) {
          var cols = trendCols[name2];
          var tmpCols = new Array(numTrendColumns);
          for (var i = 0; i < cols.length; i++) {
            tmpCols[i] = options2.summaryTrendStats[i] + "=" + decorate(cols[i], palette.cyan) + " ".repeat(trendColMaxLens[i] - strWidth(cols[i]));
          }
          return tmpCols.join(" ");
        }
        var value = nonTrendValues[name2];
        var fmtData = decorate(value, palette.cyan) + " ".repeat(nonTrendValueMaxLen - strWidth(value));
        var extras = nonTrendExtras[name2];
        if (extras.length == 1) {
          fmtData = fmtData + " " + decorate(extras[0], palette.cyan, palette.faint);
        } else if (extras.length > 1) {
          var parts = new Array(extras.length);
          for (var i = 0; i < extras.length; i++) {
            parts[i] = decorate(extras[i], palette.cyan, palette.faint) + " ".repeat(nonTrendExtraMaxLens[i] - strWidth(extras[i]));
          }
          fmtData = fmtData + " " + parts.join(" ");
        }
        return fmtData;
      };
      for (var name of names) {
        var metric = data.metrics[name];
        var mark = " ";
        var markColor = function(text) {
          return text;
        };
        if (metric.thresholds) {
          mark = succMark;
          markColor = function(text) {
            return decorate(text, palette.green);
          };
          forEach(metric.thresholds, function(name2, threshold) {
            if (!threshold.ok) {
              mark = failMark;
              markColor = function(text) {
                return decorate(text, palette.red);
              };
              return true;
            }
          });
        }
        var fmtIndent = indentForMetric(name);
        var fmtName = displayNameForMetric(name);
        fmtName = fmtName + decorate(
          ".".repeat(nameLenMax - strWidth(fmtName) - strWidth(fmtIndent) + 3) + ":",
          palette.faint
        );
        result.push(indent + fmtIndent + markColor(mark) + " " + fmtName + " " + getData(name));
      }
      return result;
    }
    function generateTextSummary(data, options2) {
      var mergedOpts = Object.assign({}, defaultOptions, data.options, options2);
      var lines = [];
      var decorate = function(text) {
        return text;
      };
      if (mergedOpts.enableColors) {
        decorate = function(text, color) {
          var result = "\x1B[" + color;
          for (var i = 2; i < arguments.length; i++) {
            result += ";" + arguments[i];
          }
          return result + "m" + text + "\x1B[0m";
        };
      }
      Array.prototype.push.apply(
        lines,
        summarizeGroup(mergedOpts.indent + "    ", data.root_group, decorate)
      );
      Array.prototype.push.apply(lines, summarizeMetrics(mergedOpts, data, decorate));
      return lines.join("\n");
    }
    var replacements = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    function escapeHTML(str) {
      return str.replace(/[&<>'"]/g, function(char) {
        return replacements[char];
      });
    }
    function generateJUnitXML(data, options2) {
      var failures = 0;
      var cases = [];
      forEach(data.metrics, function(metricName, metric) {
        if (!metric.thresholds) {
          return;
        }
        forEach(metric.thresholds, function(thresholdName, threshold) {
          if (threshold.ok) {
            cases.push(
              '<testcase name="' + escapeHTML(metricName) + " - " + escapeHTML(thresholdName) + '" />'
            );
          } else {
            failures++;
            cases.push(
              '<testcase name="' + escapeHTML(metricName) + " - " + escapeHTML(thresholdName) + '"><failure message="failed" /></testcase>'
            );
          }
        });
      });
      var name = options2 && options2.name ? escapeHTML(options2.name) : "k6 thresholds";
      return '<?xml version="1.0"?>\n<testsuites tests="' + cases.length + '" failures="' + failures + '">\n<testsuite name="' + name + '" tests="' + cases.length + '" failures="' + failures + '">' + cases.join("\n") + "\n</testsuite >\n</testsuites >";
    }
    exports2.humanizeValue = humanizeValue;
    exports2.textSummary = generateTextSummary;
    exports2.jUnit = generateJUnitXML;
  }
});

// tests/example_test.js
var example_test_exports = {};
__export(example_test_exports, {
  default: () => example_test_default,
  handleSummary: () => handleSummary,
  options: () => options
});
module.exports = __toCommonJS(example_test_exports);

// utils/generic-requests.js
var import_http = __toESM(require("k6/http"));
var import_k6 = require("k6");
var api = {
  /**
   * Generic GET request
   * @param {string} url - Request URL
   * @param {object} [headers={}] - Request headers
   * @param {object} [params={}] - Additional k6 params (tags, timeouts, etc.)
   */
  get: (url, headers = {}, params = {}) => {
    const requestParams = { ...params, headers: { ...headers, ...params.headers || {} } };
    const res = import_http.default.get(url, requestParams);
    (0, import_k6.check)(res, { "status is 200": (r) => r.status === 200 });
    return res;
  },
  /**
   * Generic POST request
   * @param {string} url - Request URL
   * @param {any} body - Request body (automatically JSON stringified if object)
   * @param {object} [headers={}] - Request headers
   * @param {object} [params={}] - Additional k6 params
   */
  post: (url, body, headers = {}, params = {}) => {
    const payload = typeof body === "object" ? JSON.stringify(body) : body;
    const requestParams = { ...params, headers: { ...headers, ...params.headers || {} } };
    const res = import_http.default.post(url, payload, requestParams);
    (0, import_k6.check)(res, { "status is 2xx": (r) => r.status >= 200 && r.status < 300 });
    return res;
  },
  /**
   * Generic PUT request
   * @param {string} url - Request URL
   * @param {any} body - Request body
   * @param {object} [headers={}] - Request headers
   * @param {object} [params={}] - Additional k6 params
   */
  put: (url, body, headers = {}, params = {}) => {
    const payload = typeof body === "object" ? JSON.stringify(body) : body;
    const requestParams = { ...params, headers: { ...headers, ...params.headers || {} } };
    const res = import_http.default.put(url, payload, requestParams);
    (0, import_k6.check)(res, { "status is 2xx": (r) => r.status >= 200 && r.status < 300 });
    return res;
  },
  /**
   * Generic UPDATE (PATCH) request
   * @param {string} url - Request URL
   * @param {any} body - Request body
   * @param {object} [headers={}] - Request headers
   * @param {object} [params={}] - Additional k6 params
   */
  update: (url, body, headers = {}, params = {}) => {
    const payload = typeof body === "object" ? JSON.stringify(body) : body;
    const requestParams = { ...params, headers: { ...headers, ...params.headers || {} } };
    const res = import_http.default.patch(url, payload, requestParams);
    (0, import_k6.check)(res, { "status is 2xx": (r) => r.status >= 200 && r.status < 300 });
    return res;
  }
};

// ../k6-html-reporter/src/modern-reporter.js
function htmlReport2(data) {
  const title = `eSewa Performance Testing Report - ${(/* @__PURE__ */ new Date()).toISOString()}`;
  const metrics = data.metrics;
  const checks = data.root_group.checks || [];
  const groups = data.root_group.groups || [];
  const getMetric = (name, field = "value") => {
    const m = metrics[name];
    if (!m) return 0;
    if (m.values) return m.values[field] || 0;
    return 0;
  };
  const toFixed = (num, decimals = 2) => {
    return typeof num === "number" ? num.toFixed(decimals) : num;
  };
  const totalReqs = getMetric("http_reqs", "count");
  const failReqs = getMetric("http_req_failed", "passes");
  const failRate = totalReqs > 0 ? (failReqs / totalReqs * 100).toFixed(2) : 0;
  const durationAvg = getMetric("http_req_duration", "avg");
  const durationP95 = getMetric("http_req_duration", "p(95)");
  const durationP99 = getMetric("http_req_duration", "p(99)");
  const durationMed = getMetric("http_req_duration", "med");
  const vusMax = getMetric("vus_max", "max");
  const vusMin = getMetric("vus", "min");
  const dataRecv = (getMetric("data_received", "rate") / 1024).toFixed(2);
  const dataSent = (getMetric("data_sent", "rate") / 1024).toFixed(2);
  const throughput = getMetric("http_reqs", "rate").toFixed(2);
  const timeWaiting = getMetric("http_req_waiting", "avg");
  const timeReceiving = getMetric("http_req_receiving", "avg");
  let apdexScore = 0.5;
  if (durationP95 < 500) apdexScore = 1;
  else if (durationP95 < 1e3) apdexScore = 0.9;
  else if (durationP95 < 2e3) apdexScore = 0.7;
  else apdexScore = 0.5;
  const generateAnalysis = () => {
    const issues = [];
    const goodPoints = [];
    let score = 100;
    let status = "Excellent";
    let statusColor = "text-green-600";
    let badgeColor = "bg-green-100 text-green-800";
    let summaryText = "";
    if (Number(failRate) > 5) {
      score -= 40;
      issues.push({ type: "critical", msg: `Critical Error Rate: ${failRate}% of requests failed. Exceeds 5% tolerance.` });
    } else if (Number(failRate) > 0) {
      score -= 10;
      issues.push({ type: "warning", msg: `Minor errors detected: ${failRate}% failure rate.` });
    } else {
      goodPoints.push("No HTTP errors detected (0.00% failure rate).");
    }
    if (durationP95 > 2e3) {
      score -= 20;
      issues.push({ type: "warning", msg: `High Latency: P95 (${toFixed(durationP95)}ms) is above 2s.` });
    } else if (durationP95 > 500) {
      issues.push({ type: "info", msg: `Moderate Latency: P95 is ${toFixed(durationP95)}ms.` });
    } else {
      goodPoints.push("Excellent low latency (P95 < 500ms).");
    }
    if (vusMax > 5 && vusMin < vusMax * 0.9) {
      score -= 5;
      issues.push({ type: "warning", msg: `Load Instability: VUs dropped from ${vusMax} to ${vusMin}.` });
    }
    if (durationAvg > durationMed * 2) {
      issues.push({ type: "info", msg: `High Skew: Avg (${toFixed(durationAvg)}ms) >> Med (${toFixed(durationMed)}ms). Outliers present.` });
    }
    if (durationP99 > durationP95 * 2) {
      issues.push({ type: "info", msg: `Tail Latency: P99 (${toFixed(durationP99)}ms) is double P95. Check extreme outliers.` });
    }
    let thresholdFailures = 0;
    if (metrics) {
      for (const key in metrics) {
        if (metrics[key].thresholds) {
          for (const thName in metrics[key].thresholds) {
            if (!metrics[key].thresholds[thName].ok) {
              thresholdFailures++;
              issues.push({ type: "critical", msg: `Threshold Failed: ${key} - ${thName}` });
            }
          }
        }
      }
    }
    if (thresholdFailures > 0) {
      score -= Math.min(40, thresholdFailures * 10);
    }
    let failedChecks = 0;
    const countFailedChecks = (grp) => {
      let fails = 0;
      if (grp.checks) grp.checks.forEach((c) => fails += c.fails > 0 ? 1 : 0);
      if (grp.groups) grp.groups.forEach((g) => fails += countFailedChecks(g));
      return fails;
    };
    failedChecks = countFailedChecks(data.root_group);
    if (failedChecks > 0) {
      score -= Math.min(30, failedChecks * 5);
      issues.push({ type: "warning", msg: `${failedChecks} checks failed assertion.` });
    } else {
      goodPoints.push("All functional checks passed.");
    }
    if (score < 50) {
      status = "Critical";
      statusColor = "text-red-600";
      badgeColor = "bg-red-100 text-red-800";
    } else if (score < 80) {
      status = "Needs Improvement";
      statusColor = "text-yellow-600";
      badgeColor = "bg-yellow-100 text-yellow-800";
    }
    summaryText = `The system handled a load of <strong>${Number(throughput)} RPS</strong> using ${vusMax} max VUs. `;
    if (score >= 80) {
      summaryText += `Performance was <strong class="text-green-600">Excellent (${score}/100)</strong>. All reliability and latency targets were met. `;
    } else {
      summaryText += `Performance was graded as <strong class="${statusColor}">${status} (${Math.max(0, score)}/100)</strong>. `;
    }
    if (Number(failRate) > 0) {
      summaryText += `Reliability was compromised by a <strong class="text-red-600">${failRate}% error rate</strong>. `;
    }
    if (durationP95 > 500) {
      summaryText += `Latency was high (P95: ${toFixed(durationP95)}ms). `;
      if (timeWaiting > timeReceiving) {
        summaryText += `The bottleneck appears to be <strong>Server Processing Time</strong> (${toFixed(timeWaiting)}ms avg wait).`;
      } else {
        summaryText += `The bottleneck appears to be <strong>Data Transfer</strong> (${toFixed(timeReceiving)}ms avg receive).`;
      }
    } else {
      summaryText += `Latency was good (P95: ${toFixed(durationP95)}ms).`;
    }
    if (durationP99 > durationP95 * 2) {
      summaryText += ` However, significant <strong>tail latency outliers</strong> were detected (P99: ${toFixed(durationP99)}ms).`;
    }
    return { score: Math.max(0, score), status, statusColor, badgeColor, summary: summaryText, issues, goodPoints };
  };
  const analysis = generateAnalysis();
  const standardMetricsList = [
    "http_req_duration",
    "http_req_waiting",
    "http_req_connecting",
    "http_req_tls_handshaking",
    "http_req_sending",
    "http_req_receiving",
    "http_req_blocked",
    "iteration_duration"
  ];
  const renderMetricRow = (key) => {
    const m = metrics[key];
    if (!m) return "";
    const v = m.values;
    return `
      <tr>
        <td class="font-medium text-gray-900 dark:text-white border-b dark:border-gray-700 p-2 text-xs">${key}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v.avg ? toFixed(v.avg) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v.min ? toFixed(v.min) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v.med ? toFixed(v.med) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v["p(90)"] ? toFixed(v["p(90)"]) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v["p(95)"] ? toFixed(v["p(95)"]) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v["p(99)"] ? toFixed(v["p(99)"]) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v.max ? toFixed(v.max) : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v.count ? v.count : "-"}</td>
        <td class="text-right border-b dark:border-gray-700 p-2 text-xs font-mono">${v.rate ? toFixed(v.rate) : "-"}</td>
      </tr>
    `;
  };
  const flattenGroups = (g) => {
    let result = [g];
    if (g.groups) {
      g.groups.forEach((sub) => {
        result = result.concat(flattenGroups(sub));
      });
    }
    return result;
  };
  const allGroups = flattenGroups(data.root_group);
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <script>
      tailwind.config = {
        darkMode: 'class',
        theme: {
          extend: {
            colors: {
              primary: '#3b82f6', secondary: '#10b981', danger: '#ef4444', darkbg: '#0f172a', cardbg: '#1e293b'
            }
          }
        }
      }
    </script>
    <style>
      body { font-family: 'Inter', sans-serif; -webkit-print-color-adjust: exact; }
      .chart-container { position: relative; height: 350px; width: 100%; }
      
      /* PDF Export Specifics */
      .pdf-export-mode .no-pdf { display: none !important; }
      .pdf-export-mode body { 
        background: white !important; 
        color: black !important; 
        margin: 0 !important;
        padding: 0 !important;
      }
      
      /* Main Content Container for PDF */
      .pdf-export-mode #report-content { 
        width: 750px !important; /* Slightly narrower than A4 (794px) for safe margins */
        min-width: 750px !important; 
        max-width: 750px !important; 
        padding: 15px !important; 
        margin: 0 auto !important; 
        position: relative !important;
        left: 0 !important;
        background-color: white !important;
        box-sizing: border-box !important;
      }
      
      /* Typography for PDF */
      .pdf-export-mode .text-3xl { font-size: 1.3rem !important; line-height: 1.3 !important; }
      .pdf-export-mode .text-2xl { font-size: 1.1rem !important; line-height: 1.3 !important; }
      .pdf-export-mode .text-xl { font-size: 1rem !important; line-height: 1.3 !important; }
      .pdf-export-mode .text-lg { font-size: 0.95rem !important; line-height: 1.2 !important; }
      .pdf-export-mode .text-sm { font-size: 0.75rem !important; line-height: 1.2 !important; }
      .pdf-export-mode .text-xs { font-size: 0.65rem !important; line-height: 1.1 !important; }
      
      /* Cards and Containers */
      .pdf-export-mode .card { 
        box-shadow: none !important; 
        border: 1px solid #ddd !important;
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        margin-bottom: 8px !important;
        padding: 8px !important;
      }
      
      /* Grid System - Convert to Single Column for PDF */
      .pdf-export-mode .grid { 
        display: block !important; 
      }
      .pdf-export-mode .grid > div {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 6px !important;
      }
      
      /* Chart Optimization for PDF */
      .pdf-export-mode .chart-container { 
        height: 220px !important; 
        width: 100% !important;
        max-width: 100% !important;
        margin: 8px auto !important;
        page-break-inside: avoid !important;
        position: relative !important;
        clear: both !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
      }
      
      /* Chart parent cards need spacing */
      .pdf-export-mode .grid.grid-cols-1.md\\:grid-cols-2 .card {
        margin-bottom: 15px !important;
        padding: 10px !important;
        clear: both !important;
        display: block !important;
        position: relative !important;
      }
      
      /* Table Optimization */
      .pdf-export-mode table { 
        font-size: 0.6rem !important; 
        width: 100% !important;
        table-layout: fixed !important;
      }
      .pdf-export-mode table th,
      .pdf-export-mode table td {
        padding: 3px 2px !important;
        word-wrap: break-word !important;
        overflow: hidden !important;
      }
      
      /* KPI Cards Layout for PDF */
      .pdf-export-mode .grid.grid-cols-2,
      .pdf-export-mode .grid.grid-cols-4 {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 6px !important;
      }
      
      /* Header Adjustments */
      .pdf-export-mode header {
        margin-bottom: 10px !important;
        padding-bottom: 8px !important;
      }
      
      /* Analysis Section */
      .pdf-export-mode .rounded-xl { border-radius: 6px !important; }
      
      /* Page Break Controls */
      .page-break-avoid { 
        page-break-inside: avoid !important; 
        break-inside: avoid !important; 
      }
      .pdf-export-mode .mb-6 { margin-bottom: 8px !important; }
      .pdf-export-mode .p-6 { padding: 8px !important; }
      .pdf-export-mode .p-4 { padding: 6px !important; }
      .pdf-export-mode .gap-4 { gap: 6px !important; }
      
      /* Ensure charts parent containers don't overflow - Single column for PDF */
      .pdf-export-mode .grid.grid-cols-1.md\\:grid-cols-2 {
        display: block !important;
      }
      .pdf-export-mode .grid.grid-cols-1.md\\:grid-cols-2 > div {
        width: 100% !important;
        max-width: 100% !important;
        margin-bottom: 8px !important;
      }
      
      /* Font weights for better PDF rendering */
      .pdf-export-mode .font-bold { font-weight: 600 !important; }
      .pdf-export-mode .font-extrabold { font-weight: 700 !important; }
      
      /* Bignum sizing for KPI cards */
      .pdf-export-mode .bignum { 
        font-size: 1.5rem !important; 
        line-height: 1.2 !important;
      }
      
      /* Check items grid */
      .pdf-export-mode .grid.lg\\:grid-cols-3 {
        display: grid !important;
        grid-template-columns: repeat(2, 1fr) !important;
        gap: 4px !important;
      }
    </style>
</head>
<body class="bg-gray-50 dark:bg-darkbg text-gray-800 dark:text-gray-200 transition-colors duration-200" id="main-body">
    <div class="min-h-screen p-6 max-w-7xl mx-auto" id="report-content">
        <!-- Header -->
        <header class="flex justify-between items-center mb-6 border-b dark:border-gray-700 pb-4">
            <div>
                <h1 class="text-3xl font-extrabold text-blue-600 dark:text-blue-400">K6 Performance Report</h1>
                <p class="text-sm text-gray-500 mt-1">${(/* @__PURE__ */ new Date()).toLocaleString()} | Duration: ${(data.state.testRunDurationMs / 1e3).toFixed(1)}s</p>
            </div>
            <div class="flex items-center gap-4 no-pdf">
                 <div class="text-right mr-4">
                    <div class="text-xs text-gray-500">Score</div>
                    <div class="text-2xl font-bold ${analysis.statusColor}">${analysis.score}</div>
                 </div>
                 <button onclick="downloadPDF()" class="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition shadow-md font-medium text-sm">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    Export PDF
                </button>
                <button onclick="document.documentElement.classList.toggle('dark')" class="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
                </button>
            </div>
        </header>

        <!-- Analysis Section -->
        <div class="bg-white dark:bg-cardbg rounded-xl shadow-sm p-6 mb-6 border-t-4 ${analysis.score > 80 ? "border-green-500" : "border-red-500"} card">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold">Expert Analysis</h2>
                <span class="px-3 py-1 rounded-full text-xs font-bold ${analysis.badgeColor}">${analysis.status}</span>
            </div>
            <div class="mb-4 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-100 dark:border-gray-700 leading-relaxed">
                ${analysis.summary}
            </div>
             <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-red-50 dark:bg-red-900/10 p-3 rounded border border-red-100 dark:border-red-900/30">
                    <h3 class="font-bold text-red-700 dark:text-red-400 text-sm mb-2">\u26A0 Issues</h3>
                    ${analysis.issues.length > 0 ? `<ul class="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">${analysis.issues.map((i) => `<li>${i.msg}</li>`).join("")}</ul>` : '<p class="text-xs text-green-600 italic">None detected.</p>'}
                </div>
                 <div class="bg-green-50 dark:bg-green-900/10 p-3 rounded border border-green-100 dark:border-green-900/30">
                    <h3 class="font-bold text-green-700 dark:text-green-400 text-sm mb-2">\u2713 Highlights</h3>
                    ${analysis.goodPoints.length > 0 ? `<ul class="list-disc list-inside space-y-1 text-xs text-gray-700 dark:text-gray-300">${analysis.goodPoints.map((p) => `<li>${p}</li>`).join("")}</ul>` : '<p class="text-xs text-gray-500 italic">None.</p>'}
                </div>
            </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">Requests</div>
                <div class="text-2xl font-bold mt-1">${totalReqs}</div>
                <div class="text-xs text-blue-500 mt-1">${getMetric("http_reqs", "rate").toFixed(1)}/s</div>
            </div>
             <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">Failures</div>
                <div class="text-2xl font-bold mt-1 ${failReqs > 0 ? "text-red-600" : "text-green-600"}">${failReqs}</div>
                <div class="text-xs text-gray-400 mt-1">${failRate}%</div>
            </div>
             <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">P95 Latency</div>
                <div class="text-2xl font-bold mt-1 text-purple-600">${toFixed(durationP95)}<span class="text-sm text-gray-400 font-normal">ms</span></div>
                <div class="text-xs text-gray-400 mt-1">Avg: ${toFixed(durationAvg)}ms</div>
            </div>
            <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">Throughput</div>
                <div class="text-2xl font-bold mt-1 text-blue-600">${throughput} <span class="text-sm font-normal text-gray-400">RPS</span></div>
                <div class="text-xs text-gray-400 mt-1">APDEX: ${apdexScore.toFixed(2)}</div>
            </div>
             <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">Network I/O</div>
                <div class="text-lg font-bold mt-1 text-gray-700 dark:text-gray-300">\u2B07 ${dataRecv} KB/s</div>
                <div class="text-xs text-gray-400 mt-1">\u2B06 ${dataSent} KB/s</div>
            </div>
            <!-- Deep Dive Row -->
             <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">Latency Details</div>
                <div class="text-sm font-bold mt-1 text-gray-700 dark:text-gray-300">Med: ${toFixed(durationMed)}ms</div>
                <div class="text-xs text-gray-400">P99: ${toFixed(durationP99)}ms</div>
            </div>
             <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <div class="text-xs text-gray-500 uppercase">Time Spent</div>
                <div class="text-sm font-bold mt-1 text-gray-700 dark:text-gray-300">Wait: ${toFixed(timeWaiting)}ms</div>
                <div class="text-xs text-gray-400">Recv: ${toFixed(timeReceiving)}ms</div>
            </div>
        </div>

        <!-- Charts -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 page-break-avoid">
            <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <h3 class="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Response Time Distribution</h3>
                <div class="chart-container">
                    <canvas id="responseTimeChart"></canvas>
                </div>
            </div>
            <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card">
                <h3 class="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4">Request Status</h3>
                 <div class="chart-container">
                    <canvas id="requestsChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Metrics Table -->
        <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 mb-6 border border-gray-100 dark:border-gray-700 card overflow-hidden">
            <h3 class="font-bold text-gray-700 dark:text-gray-300 text-sm mb-4 border-b pb-2">Technical Metrics</h3>
            <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead class="text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 uppercase">
                        <tr>
                            <th class="p-2">Name</th>
                            <th class="p-2 text-right">Avg</th>
                            <th class="p-2 text-right">Min</th>
                            <th class="p-2 text-right">Med</th>
                            <th class="p-2 text-right">P90</th>
                            <th class="p-2 text-right">P95</th>
                            <th class="p-2 text-right">P99</th>
                            <th class="p-2 text-right">Max</th>
                            <th class="p-2 text-right">Count</th>
                            <th class="p-2 text-right">Rate</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                        ${standardMetricsList.map(renderMetricRow).join("")}
                    </tbody>
                </table>
            </div>
        </div>
        
        <!-- Checks Loop -->
        <div class="space-y-4">
             ${allGroups.map((group) => {
    const groupChecks = group.checks || [];
    if (groupChecks.length === 0 && group.name === "") return "";
    return `
                    <div class="bg-white dark:bg-cardbg rounded-lg shadow-sm p-4 border border-gray-100 dark:border-gray-700 card page-break-avoid">
                        <div class="flex justify-between items-center mb-2 border-b dark:border-gray-700 pb-2">
                             <h4 class="font-bold text-sm text-gray-800 dark:text-white uppercase">${group.name || "Root Group"}</h4>
                             <span class="text-xs text-gray-500">${groupChecks.length} checks</span>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        ${groupChecks.map((check2) => `
                            <div class="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs">
                                <span class="truncate pr-2" title="${check2.name}">${check2.fails > 0 ? "\u274C" : "\u2705"} ${check2.name}</span>
                                <div class="flex-shrink-0 font-mono">
                                    <span class="text-green-600">${check2.passes}</span> / <span class="text-red-600">${check2.fails}</span>
                                </div>
                            </div>
                        `).join("")}
                        </div>
                    </div>
                    `;
  }).join("")}
        </div>
    </div>

    <script>
        function downloadPDF() {
            const element = document.getElementById('report-content');
            const body = document.body;
            
            // Toggle PDF mode classes
            body.classList.add('pdf-export-mode');
            
            // Force light mode for clean print
            const wasDark = document.documentElement.classList.contains('dark');
            document.documentElement.classList.remove('dark');

            const opt = {
                margin: [0.4, 0.4, 0.4, 0.4], // Top, Right, Bottom, Left (in inches)
                filename: 'k6-performance-report.pdf',
                image: { type: 'jpeg', quality: 0.95 },
                html2canvas: { 
                    scale: 1.5, // Reduced scale for better performance and sizing
                    useCORS: true, 
                    scrollY: 0,
                    scrollX: 0,
                    windowWidth: 750, // Match our content width
                    windowHeight: document.getElementById('report-content').scrollHeight,
                    x: 0,
                    y: 0,
                    letterRendering: true,
                    allowTaint: false,
                    backgroundColor: '#ffffff'
                },
                jsPDF: { 
                    unit: 'in', 
                    format: 'a4', 
                    orientation: 'portrait',
                    compress: true
                },
                pagebreak: { 
                    mode: ['avoid-all', 'css', 'legacy'],
                    before: '.page-break-before',
                    after: '.page-break-after',
                    avoid: '.page-break-avoid'
                }
            };

            html2pdf().set(opt).from(element).save().then(() => {
                // Restore state
                body.classList.remove('pdf-export-mode');
                if(wasDark) document.documentElement.classList.add('dark');
            });
        }
    
        // Chart setup with NO animation for better capture
        const commonOptions = {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 }, // DISABLE ANIMATION for correct PDF capture
            plugins: { legend: { display: false } }
        };

        const ctxTime = document.getElementById('responseTimeChart').getContext('2d');
        const mDuration = ${JSON.stringify(metrics["http_req_duration"] ? metrics["http_req_duration"].values : {})};
        
        Chart.defaults.color = '#6b7280';
        Chart.defaults.borderColor = 'rgba(229, 231, 235, 0.2)';

        // Conditionally include P99 only if we have meaningful data
        const hasP99 = mDuration['p(99)'] && mDuration['p(99)'] > 0;
        const chartLabels = hasP99 ? ['Avg', 'P90', 'P95', 'P99', 'Max'] : ['Avg', 'P90', 'P95', 'Max'];
        const chartData = hasP99 
            ? [
                mDuration.avg || 0, 
                mDuration['p(90)'] || 0, 
                mDuration['p(95)'] || 0, 
                mDuration['p(99)'] || 0, 
                mDuration.max || 0
              ]
            : [
                mDuration.avg || 0, 
                mDuration['p(90)'] || 0, 
                mDuration['p(95)'] || 0, 
                mDuration.max || 0
              ];
        const chartColors = hasP99 
            ? ['#3b82f6', '#8b5cf6', '#a855f7', '#d946ef', '#ef4444']
            : ['#3b82f6', '#8b5cf6', '#a855f7', '#ef4444'];

        new Chart(ctxTime, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: 'ms',
                    data: chartData,
                    backgroundColor: chartColors,
                    borderRadius: 4
                }]
            },
            options: {
                ...commonOptions,
                scales: { y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.05)' } } }
            }
        });

        const ctxReq = document.getElementById('requestsChart').getContext('2d');
        new Chart(ctxReq, {
            type: 'doughnut',
            data: {
                labels: ['Success', 'Failed'],
                datasets: [{
                    data: [${totalReqs - failReqs}, ${failReqs}],
                    backgroundColor: ['#10b981', '#ef4444'],
                    borderWidth: 0
                }]
            },
            options: {
                 ...commonOptions,
                 plugins: { 
                    legend: { 
                        display: true, 
                        position: 'top',
                        labels: {
                            padding: 15,
                            boxWidth: 15,
                            font: { size: 12 }
                        }
                    } 
                },
                layout: {
                    padding: {
                        top: 10,
                        bottom: 10,
                        left: 10,
                        right: 10
                    }
                }
            }
        });
                // Default to dark mode
         document.documentElement.classList.add('dark');
    </script>
</body>
</html>`;
}

// ../k6-html-reporter/src/index.js
var import_k6_summary = __toESM(require_k6_summary());
function generateReport(data, filename = "result.html") {
  return {
    [filename]: htmlReport2(data),
    stdout: (0, import_k6_summary.textSummary)(data, { indent: " ", enableColors: true })
  };
}

// utils/reporting.js
function generateReport2(data, filename = "result.html") {
  return generateReport(data, filename);
}

// config/user_config.js
var userConfig = {
  // Target Base URL
  baseUrl: "https://test-api.k6.io",
  // Global Headers
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer YOUR_TOKEN_HERE"
    // Optional
  },
  // Test specific configurations
  endpoints: {
    get: "/public/crocodiles/",
    post: "/user/register/",
    put: "/my/crocodiles/",
    update: "/my/crocodiles/"
  },
  // Payload for POST/PUT requests
  payloads: {
    post: {
      username: "test_user_001",
      first_name: "Test",
      last_name: "User",
      email: "test_user_001@example.com",
      password: "123"
    }
  }
};

// tests/example_test.js
var scenarios = JSON.parse(open("../config/scenarios.json"));
var selectedScenario = __ENV.SCENARIO || "smoke";
var options = {
  scenarios: {
    [selectedScenario]: scenarios[selectedScenario]
  },
  thresholds: {
    http_req_failed: ["rate<0.05"],
    // http errors should be less than 5%
    http_req_duration: ["p(95)<2000"]
    // 95% of requests should be below 2000ms
  }
};
function example_test_default() {
  const baseUrl = userConfig.baseUrl;
  const headers = userConfig.headers;
  console.log(`Running ${selectedScenario} test on ${baseUrl}`);
  api.get("https://test.k6.io", {}, { tags: { name: "SimpleDemo" } });
}
function handleSummary(data) {
  return generateReport2(data, `reports/performance-test-report.html`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handleSummary,
  options
});
