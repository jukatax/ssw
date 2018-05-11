// ==UserScript==
// @name         T-test widget
// @namespace    https://sc3.omniture.com
// @version      0.4.4
// @description  Display t-test calculation box
// @author       Yuliyan
// @match        https://*.omniture.com/*
// @include      https://*.omniture.com/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/jukatax/ssw/master/t-test_widget.js
// @downloadURL  https://raw.githubusercontent.com/jukatax/ssw/master/t-test_widget.js
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    // nodelist hack to use map and foreach
    (function() {
        if (typeof NodeList.prototype.forEach === "function") {
            return false;
        } else { NodeList.prototype.forEach = Array.prototype.forEach; }
    })();
    (function() {
        if (typeof NodeList.prototype.map === "function") {
            return false;
        } else { NodeList.prototype.map = Array.prototype.map; }
    })();
    //console.log("T-test widget running...");
    const w = window;
    const doc = document;
    w.ttestwidget = {
        name : "T-test widget",
        version: '0.4.4',
        styles: {
            bckgrnd_clr: '#f4f7f1',
            main_clr: '#19405b',
            active_clr: '#3778ad',
            //bannerPos : (doc.cookie.match(/sspleft/ig)?"left":doc.cookie.match(/sspright/ig)?"right":doc.cookie.match(/sspcenter/ig)?"center":"left"),
            logs : [
                'background: linear-gradient(to bottom, #fcb200 1%,#ff7a00 100%)',
                'color: #222',
                'padding : 5px 10px'
            ],
            //xwrapper: "padding : 5px 8px; position : absolute; top : 0; right : 0; color : #f00; background : rgba(235,28,36,0.4);cursor : pointer;",
            all: ".hide{display : none!important;}" +
                "#significance_widget{position : fixed; z-index : 9999999999; top : 10px;width: auto;min-width: 280px;max-width: 500px;  padding : 12px 5px 0; background : rgba(255,255,255,0.95); box-shadow : 0 0 5px #555; -moz-box-shadow : 0 0 5px #555; -webkit-box-shadow : 0 0 5px #555;color: #19405b;font-family : Helvetica, Arial;font-size: 12px;border-radius: 3px;transition : left 1s ease-in-out;} " +
                "#significance_widget.center{left : calc(50% - 165px);}"+
                "#significance_widget.left{left : 10px;}"+
                "#significance_widget.right{left  :calc(100% - 340px);}"+
                "#significance_widget > *{box-sizing : border-box;}"+
                "#significance_widget .wrapper .vwrap{position:absolute;top:8px;left:8px;font-size : 0.8em;line-height : 8px;font-style: italic;}" +
                "#significance_widget .wrapper .positions{ position:absolute;top:8px;left:calc(50% - 25px);font-size : 0.8em;line-height : 8px;font-style: italic; }"+
                "#significance_widget .wrapper .positions span:hover{ cursor:pointer; text-decoration : underline; }"+
                "#significance_widget .wrapper .box_wrap{display : flex;width : 320px;flex-direction: column;flex-wrap: nowrap; justify-content : space-between;align-items : center;}" +
                "#significance_widget .wrapper .box_wrap .box{ margin : 5px 0;    width: 100%;}" +
                "#significance_widget .wrapper .box_wrap .top_labels{display : inline-block; width : calc(42% - 8px );text-align : center;}" +
                "#significance_widget .wrapper .box_wrap .box label{padding : 3px; margin : 0 3px 0 0; width : calc(16% - 9px );display : inline-block;text-align: center;}" +
                "#significance_widget .wrapper .box_wrap .box .input{border : 1px solid #19405b;margin:0 3px;padding:3px 0;text-align: center;line-height : 14px;width : calc(42% - 8px );}" +
                "#significance_widget .wrapper .box_wrap .box .input:focus{border : 1px solid aqua;box-shadow : 0 0 3px aqua; outline:none;}" +
                "#significance_widget .wrapper .box_wrap .box .input.active{border : 1px solid aqua;box-shadow : 0 0 3px aqua; outline:none;}" +
                //"#significance_widget .wrapper .box_wrap .box .btn{float:none;color : #fff;font-size: 12px;padding: 3px 10px;line-height: 14px;margin: 0; border : 1px solid #19405b;}" +
                "#significance_widget .wrapper #cerror{color : #fff; background : #f00; padding: 2px 5px;font-size: 0.9em;}" +
                "#significance_widget .wrapper #significance_report{width : calc(100% - 2px); font-size : 0.9em;border : 1px solid #19405b;border-radius : 3px;margin : 5px 0;padding : 5px 2px;}" +
                "#significance_widget .wrapper #significance_report p{margin : 3px 0;}" +
                "#significance_widget .wrapper #removewidget{padding : 5px 8px; position : absolute; top : 0; right : 0; color : #f00; background : rgba(235,28,36,0.4);cursor : pointer;}"
        },
        cookieName: "ssp"+(doc.cookie.match(/sspleft/ig)?"left":doc.cookie.match(/sspright/ig)?"right":doc.cookie.match(/sspcenter/ig)?"center":"left"),
        domain: doc.domain.split('.').length > 2 ? doc.domain.split('.')[doc.domain.split('.').length - 2] + "." + doc.domain.split('.')[doc.domain.split('.').length - 1] : doc.domain,
        cerror : null,
        mainWidgetContainer : null,
        controlhits : null,
        varianthits : null,
        significanceReport : null,
        logger : (...msg)=>{
            const consoleStyles = w.ttestwidget.styles.logs.join(';');
            console.log("%c "+(msg)+" ",consoleStyles);
        },
        toggleWidget: function(e) {
            var evtobj = w.event ? event : e;
            if ((evtobj.metaKey || evtobj.ctrlKey) && evtobj.shiftKey && evtobj.keyCode === 89) {
                if (doc.querySelector("#significance_widget")) {
                    doc.querySelector("#significance_widget").classList.toggle("hide");
                }
            }
        },
        setCookie: function(exdays) {
            var dt = new Date(),
                cname = w.ttestwidget.cookieName,
                cerror = doc.getElementById("cerror");
            if (cname && cname.trim().length>1) {
                dt.setTime(dt.getTime() + (exdays * 24 * 60 * 60 * 1000));
                var expires = "expires=" + dt.toUTCString();
                doc.cookie = cname + "=1;path=/;domain=" + widget.domain + ";" + expires;
                cerror.innerHTML = "Cookie has been Set!";
                if (exdays === -1 || exdays === '-1') {
                    doc.cookie = cname + "=0;path=/;domain=" + widget.domain + ";expires=Thu, 18 Dec 2013 12:00:00 UTC;";
                    //w.localStorage.clear();
                    //w.sessionStorage.clear();
                }
            }
        },
        checkHitsProportion: function(chits,vhits) {
          return (Math.abs(chits - vhits)/chits > 0.2)? false : true ;
        },
        setErrorMessage : function(msg){
           w.ttestwidget.cerror.innerHTML = msg;
        },
        clearErrorMessage : function(){
           w.ttestwidget.cerror.innerHTML = "";
        },
        manageResults : function(){
            if(w.ttestwidget.checkHitsProportion(w.ttestwidget.controlhits.value,w.ttestwidget.varianthits.value)){
                w.ttestwidget.clearErrorMessage();
                w.ttestwidget.cerror.classList.add("hide");
                w.ttestwidget.calculateSignificance();
            }else{
                w.ttestwidget.cerror.classList.remove("hide");
                w.ttestwidget.setErrorMessage("Hits difference is higher than 20%.<br />Significance results will be inaccurate!");
                w.ttestwidget.significanceReport.innerHTML = "";
            }
        },
        getTextContent: function(e) {
            if (!w.ttestwidget.mainWidgetContainer.contains((e.target))) {
                //w.ttestwidget.logger(e.target.textContent);
                //w.ttestwidget.logger(e.target.textContent.replace(/[a-zA-Z_ \-:\'\", ]+/ig , ""));
                doc.querySelector(".input.active").value = parseInt(e.target.textContent.replace(/[a-zA-Z_ \-:\'\", ]+/ig, "")) || 0;
            }
            if (w.ttestwidget.readyToCalculateSignificance() && !w.ttestwidget.mainWidgetContainer.contains((e.target)) ) {
                w.ttestwidget.manageResults();
                //w.ttestwidget.logger("Results from getTextContent...");
            }
        },
        setActiveInput: function(e) {
            doc.querySelector("#significance_widget .box input.active").classList.remove("active");
            e.target.classList.add("active");
        },
        _debouncer : function(func, time_ms) {
            var t_o;
            return function () {
                var context = this, args = arguments;
                var runner = ()=> {
                    t_o = null;
                    func.apply(context, args);
                };
                clearTimeout(t_o);
                t_o = setTimeout(runner, time_ms);

            };
        },
        readyToCalculateSignificance: function() {
            let isReady = [];
            document.querySelectorAll("#significance_widget .box input").forEach(
                (val, ind) => {
                    isReady.push(Boolean(val.value && val.value.trim() !== "" && val.value !== "0"));
                });
            return isReady.indexOf(false) !== -1 ? false : true;
        },
        calculateSignificance: function() {
            var confidence_stats = [];
            var cr = function(t) {
                return t.conversions / t.hits;
            }; // cr

            /**
             * Calculation of score
             * @param c
             * @param t
             */
            var calcZScore = function(c, t) {
                /*var z = Math.abs(cr(t) - cr(c));
                 var s = (cr(t) * (1 - cr(t))) / t.hits + (cr(c) * (1 - cr(c))) / c.hits;
                 return z/Math.sqrt(s);*/
                //standard error
                var c_se = Math.sqrt(cr(c) * (Math.abs(1 - cr(c))) / c.hits);
                var t_se = Math.sqrt(cr(t) * (Math.abs(1 - cr(t))) / t.hits);
                return Math.abs(cr(t) - cr(c)) / Math.sqrt(Math.pow(c_se, 2) + Math.pow(t_se, 2));
            }; // calcZScore
            /**
             * Calculate the Cumulative Normal Distribtion
             *
             * @param x
             * @returns {number}
             */
            var cumNorDist = function(x) {
                var b1 = 0.319381530;
                var b2 = -0.356563782;
                var b3 = 1.781477937;
                var b4 = -1.821255978;
                var b5 = 1.330274429;
                var p = 0.2316419;
                var c = 0.39894228;
                var t;

                if (x >= 0.0) {
                    t = 1.0 / (1.0 + p * x);
                    return (1.0 - c * Math.exp(-x * x / 2.0) * t *
                        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
                } else {
                    t = 1.0 / (1.0 - p * x);
                    return (c * Math.exp(-x * x / 2.0) * t *
                        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
                }
            }; // cumNorDist
            //second edition
            function cumNorDist_2(z) {
                var erf = function(k) {
                    var a1 = 0.254829592;
                    var a2 = -0.284496736;
                    var a3 = 1.421413741;
                    var a4 = -1.453152027;
                    var a5 = 1.061405429;
                    var p = 0.3275911;
                    var t = (1 / (1 + (p * k)));
                    k = Math.abs(k);
                    //return 1 - ( ( ( ( ( (a5*t + a4) *t) +a3) *t +a2) *t) +a1) *t  * Math.exp(-1 * (k * k))  + 0.000000145;
                    return 1 - ((((((a5 * t + a4) * t) + a3) * t + a2) * t) + a1) * t * Math.exp(-1 * (k * k));
                }; // erf = error function that approximates the normal distribution of a z-score -> Normsdist(z,true)
                var sign = z < 0 ? -1 : 1;
                return 0.5 * (1 + sign * erf(Math.abs(z) / Math.sqrt(2)));
            } // cumNorDist_2
            /**
             * Given a conversion rate, calculate a recommended sample
             * size
             * E.g: 0.25 worst, 0.15, 0.05 best at a 95% confidence
             * @param conv
             * @returns {Array}
             */
            var sampleSize = function(conv) {
                var a = 3.84145882689;
                var res = [];
                var bs = [0.0625, 0.0225, 0.0025];
                var len = bs.length;
                for (var i = 0; i < len; i++) {
                    res.push(((1 - conv) * a / (bs[i] * conv)));
                }
                return res;
            }; // sampleSize
            /**
             * Given a z-score calculate a t-test
             * E.g: GetZPercent(1.461551 , 2) , 2 tailed t-test of a z-score
             * @param z [float] - the z-score to compute the t-test of
             * @param tails [int] - 1 or 2 tailed t-test
             * @returns confidence percantage
             */
            function GetZPercent(z, tails) {
                if (z < -6.5)
                    return 0.0;
                if (z > 6.5)
                    return 1.0;

                if (z > 0) {
                    z = -z;
                }

                var factK = 1;
                var sum = 0;
                var term = 1;
                var k = 0;
                var loopStop = Math.exp(-23);
                while (Math.abs(term) > loopStop) {
                    term = 0.3989422804 * Math.pow(-1, k) * Math.pow(z, k) / (2 * k + 1) / Math.pow(2, k) * Math.pow(z, k + 1) / factK;
                    sum += term;
                    k++;
                    factK *= k;

                }
                sum += 0.5;

                return (tails * sum);
            } //GetZPercent

            /**
             * Calculate the significance between Control and Treatment [A/B/C]
             *
             * @param controlObj
             * @param treatmentObj
             */
            var calculateSig = function(controlObj, treatmentObj) {

                if (typeof controlObj !== 'object') {
                    console.log(outputErrorFor('Control Object'));
                }

                if (typeof controlObj !== 'object') {
                    console.log(outputErrorFor('Control Object'));
                }

                var zScore;
                var confidence;
                var cRatio;
                var p_value;

                var cNumHits = controlObj.hits;
                var cNumConver = controlObj.conversions;
                var tNumHits = treatmentObj.hits;
                var tNumConver = treatmentObj.conversions;

                var cConversionRate = (cNumConver / cNumHits) * 100;
                var tConversionRate = (tNumConver / tNumHits) * 100;

                //cConversionRate += '%';
                //tConversionRate += '%';

                zScore = calcZScore(controlObj, treatmentObj);
                //confidence = cumNorDist(zScore);
                confidence = GetZPercent(zScore, 2);
                p_value = ((1 - confidence) === 0 ? 1 : 1 - confidence);
                // 2-tailed test  : Variant is Different than Control
                var c80 = (Math.abs(zScore) > 1.282) && (p_value > 0.9 || p_value < 0.1) && (confidence !== 0 && zScore !== 0) ? "yes" : "no";
                var c90 = (Math.abs(zScore) > 1.645) && (p_value > 0.95 || p_value < 0.05) && (confidence !== 0 && zScore !== 0) ? "yes" : "no";
                var c95 = (Math.abs(zScore) > 1.9600) && (p_value > 0.975 || p_value < 0.025) && (confidence !== 0 && zScore !== 0) ? "yes" : "no";
                var c99 = (Math.abs(zScore) > 2.576) && (p_value > 0.995 || p_value < 0.005) && (confidence !== 0 && zScore !== 0) ? "yes" : "no";
                var c999 = (Math.abs(zScore) > 3.291) && (p_value > 0.998 || p_value < 0.002) && (confidence !== 0 && zScore !== 0) ? "yes" : "no";
                /*
         console.log("Control Hits is:", cNumHits);
         console.log("Control Conversions is:", cNumConver);
         console.log("Treatment Hits is:", tNumHits);
         console.log("Treatment Conversions is:", tNumConver);
         */
                //console.log("==================\n\tResults are in:");
                //console.log("\tcConversionRate < tConversionRate:", (cConversionRate < tConversionRate) );
                console.log("\tWinner is:", cConversionRate < tConversionRate && c95 === "yes" ? "Winner is variant" : cConversionRate > tConversionRate && c95 === "yes" ? "Winner is control" : "");
                //console.log("\tControl Conversion Rate is:", cConversionRate);
                console.log("\tControl Conversion Rate is:", cConversionRate+'%');
                console.log("\tTreatment Conversion Rate is:", tConversionRate+'%');

                console.log("\tZ Score is:", zScore);
                console.log("\tConfidence is:", confidence);
                console.log("\tp_value(1-confidence) = ", p_value, "\n==================\n\n\n");
                /*
         console.log("80% Confidence: ", (Math.abs(confidence)>=1.282) || (p_value>=0.8 || p_value<=0.2)?"yes":"no");
         console.log("90% Confidence: ", (Math.abs(confidence)>=1.645) || (p_value>=0.9 || p_value<=0.1)?"yes":"no");
         console.log("95% Confidence: ", (Math.abs(confidence)>=1.9600) || (p_value>=0.95 || p_value<=0.05)?"yes":"no");
         console.log("99% Confidence: ", (Math.abs(confidence)>=2.576) || (p_value>=0.99 || p_value<=0.01)?"yes":"no");
         */
                var winnerIs = cConversionRate < tConversionRate && c95 === "yes" ? "Winner is variant" : cConversionRate > tConversionRate && c95 === "yes" ? "Winner is control" : "";
                confidence_stats.push(["<p>" + winnerIs + "</p><p>Significance breakdown:<br />[ 80%:" + c80 + " ] [ 90%:" + c90 + " ] [ 95%:" + c95 + " ] [ 99%:" + c99 + " ] [ 99.9%:" + c999 + " ]</p><p>P value: " + p_value.toFixed(4) + "</p><p>Z Score: " + zScore.toFixed(4) + "</p>"]);
            }; // calculateSig

            /**
             *
             * @param name
             * @returns {string}
             */
            var outputErrorFor = function(name) {
                return 'The passed in parameter must be an object and contain two properties: "hits" and "conversions" for: ' + name;
            };

            //example


            var control = { hits: parseInt(document.getElementById("control_visits").value), conversions: parseInt(document.getElementById("control_conversions").value) };
            var variant = { hits: parseInt(document.getElementById("variant_visits").value), conversions: parseInt(document.getElementById("variant_conversions").value) };
            calculateSig(control, variant);
            doc.querySelector("#significance_report").innerHTML = confidence_stats.join(" ");

        },
        setWidgetPosition : (pos,e)=>{
            let currentClass = w.ttestwidget.cookieName.substring(3);
            w.ttestwidget.setCookie(-1);
            w.ttestwidget.cookieName = "ssp"+pos;
            w.ttestwidget.mainWidgetContainer.classList.remove(currentClass);
            w.ttestwidget.mainWidgetContainer.classList.add(pos);
            w.ttestwidget.setCookie(30);
        },
        setDOMVariables : ()=>{
            w.ttestwidget.cerror = doc.getElementById("cerror");
            w.ttestwidget.mainWidgetContainer =doc.getElementById("significance_widget");
            w.ttestwidget.controlhits = doc.getElementById("control_visits");
            w.ttestwidget.varianthits = doc.getElementById("variant_visits");
            w.ttestwidget.significanceReport = doc.getElementById("significance_report");
        },
        setDOMEventListeners : ()=>{
            doc.getElementById("removewidget").addEventListener("click", function() {
                doc.querySelectorAll("#significance_widget .box input").forEach(function(val, ind) {
                    val.removeEventListener("click", w.ttestwidget.setActiveInput);
                    val.removeEventListener("focus", w.ttestwidget.setActiveInput);
                    val.removeEventListener("keyup", debouncedFunc);
                });
                doc.body.removeChild(doc.getElementById("significance_widget"));
                doc.removeEventListener("click", w.ttestwidget.getTextContent);
            }, false);
            /* handle hide/show widget */
            doc.onkeydown = widget.toggleWidget;
            /* add active input value when clicking on a dom element */
            doc.addEventListener("click", w.ttestwidget.getTextContent, false);
            /* handle input fields click focus and keyup */
             // Add debouncer function for keyup event
            let debouncedFunc = w.ttestwidget._debouncer(()=> {
                if (w.ttestwidget.readyToCalculateSignificance()) {
                    w.ttestwidget.manageResults();
                }
            }, 500);
            doc.querySelectorAll("#significance_widget .box input").forEach(function(val, ind) {
                val.addEventListener("click", w.ttestwidget.setActiveInput, false);
                val.addEventListener("focus", w.ttestwidget.setActiveInput, false);
                val.addEventListener("keyup", debouncedFunc, false);
            });
            /* set widget position */
            doc.querySelectorAll("#significance_widget .wrapper .positions span").forEach(function(val, ind) {
                let pos = val.getAttribute("data-pos");
                val.addEventListener("click", w.ttestwidget.setWidgetPosition.bind(null,pos,event), false);
            });
        },
        createwidget: function() {
            var stls = doc.createElement("style");
            stls.textContent = widget.styles.all;
            doc.head.appendChild(stls);
            var content = '<div class="wrapper">'+
                '<div class="positions"> <span data-pos="left">left</span> <span data-pos="center">center</span> <span data-pos="right">right</span>   </div>'+
                '<span class="vwrap">v: ' + widget.version + '</span><span id="removewidget"> X </span>' +
                '<div class="box_wrap">' +
                '<div class="labels box">' +
                '<label class="top_labels"></label>' +
                '<span class="top_labels">hits</span>' +
                '<span class="top_labels">conversions</span>' +
                '</div>' +
                '<div class="variant box">' +
                '<label for="control_visits">control</label>' +
                '<input type="text" placeholder="visits" id="control_visits" class="input active" autofocus value=""  />' +
                '<input type="text" placeholder="conversions" id="control_conversions" class="input" value=""  />' +
                '</div>' +
                '<div class="variant box">' +
                '<label for="control_visits">variant</label>' +
                '<input type="text" placeholder="visits" id="variant_visits" class="input"  value=""  />' +
                '<input type="text" placeholder="conversions" id="variant_conversions" class="input" value=""  />' +
                '</div>' +
                /*  '<button id="setcookie" class="btn box">Calculate significance</button>'+
                  '<button id="remcookie" class="btn box">Remove</button>' + */
                '<div id="cerror" class="box error hide"></div>' +
                '<div id="significance_report" class="box report"></div>' +
                '</div>' +
                '</div>';
            var div = doc.createElement("div");
            div.id = "significance_widget";
            div.setAttribute("class",(doc.cookie.match(/sspleft/ig)?"left":doc.cookie.match(/sspright/ig)?"right":doc.cookie.match(/sspcenter/ig)?"center":"left"));
            div.innerHTML = content;
            if (!doc.querySelector("#significance_widget")) { doc.body.appendChild(div); }
            /* ============================================================================== */
            /* ============================================================================== */
            /* ============================================================================== */
            /* ============================================================================== */
            // log the version of the widget
            w.ttestwidget.logger(w.ttestwidget.name+" version: "+w.ttestwidget.version);
        },
        init: function() {
            w.ttestwidget.createwidget();
            w.ttestwidget.setDOMVariables();
            w.ttestwidget.setDOMEventListeners();
        }
    };
    w.ttestwidget.init();
})();