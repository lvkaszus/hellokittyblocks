document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        document.querySelector('#loader-heading').classList.add('loader-fade-out')

        document.querySelector('#loader-description').classList.add('loader-fade-out')

        document.querySelector('#loader-credits').classList.add('loader-fade-out')
        document.querySelector('#loader-dedication').classList.add('loader-fade-out')

        document.querySelector('#loader-main').classList.add('loader-main-fade-out')
    }, 2000);  
    setTimeout(function() {
        document.querySelector('#loader-main').remove()
    }, 3000);

    (function() {
        'use strict';
    
    
        const svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttribute("viewBox", "-5 -10 110 200");
        document.body.appendChild(svgElement);
    
    
        var c = window.common();
        //var c = window.common(true, 42);
    
    
        var svgScale = function(s) {
            var bbox = s.node.getBoundingClientRect();
            var vb = s.node.getAttribute('viewBox').split(' ').map(parseFloat);
            return Math.max(
                vb[2] / bbox.width,
                vb[3] / bbox.height
            );
        };
    
    
    
        var hasTouch = function() {
            return 'ontouchstart' in window || (window.DocumentTouch && document instanceof DocumentTouch) || 'ontouchstart' in document.documentElement;
        };
    
    
    
        var alert = function(msg, cb) {
            var g = s.group();
            g.addClass('alert');
            var r = s.rect(-5, -30, 110, 250);
            r.attr('fill', 'fill-0');
            r.attr('opacity', 0.75);
            var t = s.text(50, 70, msg);
            t.attr('text-anchor', 'middle');
            g.add(r);
            g.add(t);
            g.addClass('score');
    
            var onClick = function() {
                g.remove();
                if (cb) { cb(); }
            };
    
            g.node.addEventListener('mousedown',  onClick);
            g.node.addEventListener('touchstart', onClick);
        };
    
    
    
        var loadHighScore = function() {
            try {
                var hsc = localStorage.getItem(LS_KEY);
                if (hsc && hsc.length > 0) {
                    return parseInt(hsc, 10);
                }
            } catch (ex) {}
            return 0;
        };
    
    
    
        var saveHighScore = function(hsc) {
            try {
                localStorage.setItem(LS_KEY, hsc);
            } catch (ex) {}
        };
    
    
    
        var l = 10;
        var L = 9.5;
        var gridShiftY = 25;
        var R = 1;
        var LS_KEY = 'hellokittyblocks_high_score';
        var slotY = 100 + 50*0.25;
        var slotXs = c.seq(3).map(function(i) { return (i+0.5)*0.33333*100; });
        var gap = hasTouch() ? -2*10 : 0; // finger gap so you can see the piece while dragging
    
        var s;
        var sSlots = new Array(3);
        var sMatrix = c.mtx(10, 10);
    
        var st = c.initialState();
        var highScore = loadHighScore(LS_KEY);
    
    
    
        var updateScore = function() {
            var score = st.score;
    
            if (score > highScore) {
                highScore = score;
                saveHighScore(highScore);
                updateHighScore(highScore);
            }
    
            //console.log(score);
            s.select('.score').attr('text', score);
        };
    
    
    
        var updateHighScore = function(highScore) {
            s.select('.high-score').attr('text', highScore);
        };
    
    
        var updateFromMatrix = function() {
            c.seq(10).forEach(function(y) {
                c.seq(10).forEach(function(x) {
                    var v = st.m.get(x, y);
                    var r = sMatrix.get(x, y);
                    r.attr('class', 'fill-' + v);
                });
            });
        };
    
    
    
        var checkSlots = function() {
            if (!sSlots[0] && !sSlots[1] && !sSlots[2]) {
                c.seq(3).forEach(function(i) {
                    createPiece(st.slots[i], i);
                });
            }
        };
    
    
    
        var reset = function() {
            st = c.initialState();
            updateScore(0);
    
            c.seq(10).forEach(function(y) {
                c.seq(10).forEach(function(x) {
                    var r = sMatrix.get(x, y);
                    r.attr('class', 'fill-0');
                });
            });
    
            c.seq(3).forEach(function(i) {
                if (sSlots[i]) {
                    sSlots[i].remove();
                    sSlots[i] = undefined;
                }
            });
    
            checkSlots();
        };
    
    
    
        var createPiece = function(p, slot) {
            var g = s.group();
            g.addClass('in-slot-' + slot);
            var dims = p.dims;
    
            var r = s.rect((dims[0]-5)*5, (dims[1]-5)*5, 50, 50);
            r.attr('class', 'trans');
            g.add(r);
    
            p.p.forEach(function(pos) {
                var r = s.rect(pos[0]*l, pos[1]*l + gridShiftY, L, L, R, R);
                r.attr('class', 'fill-' + p.t);
                g.add(r);
            });
    
            g.transform(
                Snap
                    .matrix()
                    .translate(slotXs[slot], slotY)
                    .scale(0.5, 0.5)
                    .translate(-dims[0]*10/2, -dims[1]*10/2 + 40)
                    .toTransformString()
            );
    
            sSlots[slot] = g;
    
            var scl;
            var lastPos;
            g.drag(
                function(dx, dy/*, x, y, ev*/) { // move
                    lastPos = [
                        slotXs[slot] + dx*scl,
                        slotY + dy*scl + gap
                    ];
                    g.transform(
                        Snap
                            .matrix()
                            .translate(lastPos[0], lastPos[1])
                            .translate(-dims[0]*5, -dims[1]*5)
                            .toTransformString()
                    );
                },
                function(/*x, y, ev*/) { // start
                    lastPos = [
                        slotXs[slot],
                        slotY
                    ];
                    scl = svgScale(s);
                    //console.log('start', scl);
                    g.transform(
                        Snap
                            .matrix()
                            .translate(slotXs[slot], slotY + gap)
                            .translate(-dims[0]*5, -dims[1]*5)
                            .toTransformString()
                    );
                },
                function(/*ev*/) { // end
                    var pos2 = [
                        Math.round( lastPos[0]/10 - dims[0]/2 ),
                        Math.round( lastPos[1]/10 - dims[1]/2 )
                    ];
    
                    var slot = parseInt( g.attr('class').substring(8), 10);
    
                    //console.log('end', pos2);
    
                    var result = c.playPiece(slot, pos2, st);
    
                    g.remove();
                    sSlots[slot] = undefined;
    
                    if (typeof result === 'object') {
                        createPiece(p, slot);
                    }
                    else {
                        st.ended = result;
                        updateScore(st.score);
                        updateFromMatrix();
    
                        if (st.ended) {
                            alert('koniec gry', reset);
                        }
                        else {
                            checkSlots();
                        }
                    }
                }
            );
    
            return g;
        };
    
    
    
        // http://snapsvg.io/docs
    
        s = Snap('svg');
        s.select('desc').remove();
    
    
        // setup scores
        (function() {
            var hsc = s.text(20, 7, loadHighScore());
            hsc.attr('text-anchor', 'middle');
            hsc.addClass('high-score');
            
            var image = s.image('vendor/hellokitty_highscore.webp', 0, -5, 12, 15);
            
            var sc = s.text(45, 15, '0');
            sc.attr('text-anchor', 'start');
            sc.addClass('score');
            
            s.add(image, hsc, sc);
        })();
    
    
        // setup empty matrix
        var mtxG = s.group();
        mtxG.addClass('matrix');
        
        c.seq(10).forEach(function(y) {
            c.seq(10).forEach(function(x) {
                var rectY = (y * l) + gridShiftY;
                var r = s.rect(x * l, rectY, L, L, R, R);
                mtxG.add(r);
                r.attr('class', 'fill-0');
                sMatrix.set(x, y, r);
            });
        });
    
    
    
        // populate slots
        c.seq(3).forEach(function(slot) {
            createPiece(st.slots[slot], slot);
        });
    
    
    
        var footer = s.image('vendor/hellokitty_footer.webp', 40, 170, 20, 13);
        s.add(footer);
    
    
    
        // load high score
        updateHighScore(highScore);
    })();
    
  });