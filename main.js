document.addEventListener("DOMContentLoaded", function (event) {

    //create audio context
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)()


    //define keyboard frequency map
    const keyboardFrequencyMap = {
        '90': 261.625565300598634, //Z - C
        '83': 277.182630976872096, //S - C#
        '88': 293.664767917407560,  //X - D
        '68': 311.126983722080910, //D - D#
        '67': 329.627556912869929,  //C - E
        '86': 349.228231433003884,  //V - F
        '71': 369.994422711634398, //G - F#
        '66': 391.995435981749294,  //B - G
        '72': 415.304697579945138, //H - G#
        '78': 440.000000000000000,  //N - A
        '74': 466.163761518089916, //J - A#
        '77': 493.883301256124111,  //M - B
        '81': 523.251130601197269,  //Q - C
        '50': 554.365261953744192, //2 - C#
        '87': 587.329535834815120,  //W - D
        '51': 622.253967444161821, //3 - D#
        '69': 659.255113825739859,  //E - E
        '82': 698.456462866007768,  //R - F
        '53': 739.988845423268797, //5 - F#
        '84': 783.990871963498588,  //T - G
        '54': 830.609395159890277, //6 - G#
        '89': 880.000000000000000,  //Y - A
        '55': 932.327523036179832, //7 - A#
        '85': 987.766602512248223,  //U - B
    }

    //radio elements:
    var mod1typeRadio = document.getElementsByName("mod1type");
    var mod1wavetypeRadio = document.getElementsByName("mod1wavetype");
    var LFOmodtypeRadio = document.getElementsByName("LFOmodtype");
    var LFOwavetypeRadio = document.getElementsByName("LFOwavetype");
    var mod3typeRadio = document.getElementsByName("mod3type");
    var mod3wavetypeRadio = document.getElementsByName("mod3wavetype");
    var osc1typeRadio = document.getElementsByName("osc1wavetype");
    var osc2typeRadio = document.getElementsByName("osc2wavetype");
    var osc3typeRadio = document.getElementsByName("osc3wavetype");


    //slider elements:
    var mod1freq = getSliderVal("mod1freq");
    var mod1index = getSliderVal("mod1index");;
    var LFOfreq = getSliderVal("LFOfreq");;
    var LFOindex = getSliderVal("LFOindex");
    var mod3freq = getSliderVal("mod3freq");
    var mod3index = getSliderVal("mod3index");
    var osc1freq = getSliderVal("osc1freq");
    var osc2freq = getSliderVal("osc2freq");
    var osc3freq = getSliderVal("osc3freq");

    var osc1mix = getSliderVal("osc1mix");
    var osc2mix = getSliderVal("osc2mix");
    var osc3mix = getSliderVal("osc3mix");

    var attack = getSliderVal("attack");
    var decay = getSliderVal("decay");
    var sustain = getSliderVal("sustain");
    var release = getSliderVal("release");

    var volumeControl = document.getElementById("volume");


    clipping = document.getElementById("clipping");

    //display values and get values from sliders...
    document.getElementById("mod1freq").oninput = function () {
        mod1freq = getSliderVal("mod1freq");
        displaySliderVal("mod1freq");
    }
    document.getElementById("mod1index").oninput = function () {
        mod1index = getSliderVal("mod1index");
        displaySliderVal("mod1index");
    }
    document.getElementById("LFOfreq").oninput = function () {
        LFOfreq = getSliderVal("LFOfreq");
        displaySliderVal("LFOfreq");
    }
    document.getElementById("LFOindex").oninput = function () {
        LFOindex = getSliderVal("LFOindex");
        displaySliderVal("LFOindex");
    }
    document.getElementById("mod3freq").oninput = function () {
        mod3freq = getSliderVal("mod3freq");
        displaySliderVal("mod3freq");
    }
    document.getElementById("mod3index").oninput = function () {
        mod3index = getSliderVal("mod3index");
        displaySliderVal("mod3index");
    }
    document.getElementById("osc1freq").oninput = function () {
        osc1freq = getSliderVal("osc1freq");
        displaySliderVal("osc1freq");
    }
    document.getElementById("osc2freq").oninput = function () {
        osc2freq = getSliderVal("osc2freq");
        displaySliderVal("osc2freq");
    }
    document.getElementById("osc3freq").oninput = function () {
        osc3freq = getSliderVal("osc3freq");
        displaySliderVal("osc3freq");
    }

    //these don't need displaying
    document.getElementById("osc1mix").oninput = function () {
        osc1mix = getSliderVal("osc1mix");
    }
    document.getElementById("osc2mix").oninput = function () {
        osc2mix = getSliderVal("osc2mix");
    }
    document.getElementById("osc3mix").oninput = function () {
        osc3mix = getSliderVal("osc3mix");
    }
    document.getElementById("attack").oninput = function () {
        attack = getSliderVal("attack");
    }
    document.getElementById("sustain").oninput = function () {
        sustain = getSliderVal("sustain");
    }
    document.getElementById("decay").oninput = function () {
        decay = getSliderVal("decay");
    }
    document.getElementById("release").oninput = function () {
        release = getSliderVal("release");
    }



    //set up main gain node, initalize to 0
    const globalGain = audioCtx.createGain();
    globalGain.gain.value = volume.value;
    globalGain.connect(audioCtx.destination);

    volume.addEventListener('change', changeVolume, false);

    //listen for keyup keydowns
    window.addEventListener('keydown', keyDown, false);
    window.addEventListener('keyup', keyUp, false); 

    //keep track of active notes 
    activeEngines = {};
    activeEngineOscs = {};
    activeEngineGains = {}; 

    //ON KEYDOWN: 
    function keyDown(event) {
        const key = (event.detail || event.which).toString(); //get key from press
        if (keyboardFrequencyMap[key] && !activeEngines[key]) { //if key in map and not already playing,
            playNote(key);
        }
    }

    //ON KEYUP:
    function keyUp(event) {
        const key = (event.detail || event.which).toString();
        if (keyboardFrequencyMap[key] && activeEngines[key]) {
            stopNote(key);
        }
    }

    //play note
    function playNote(key) {

        var mod1type = getRadioVal(mod1typeRadio);
        var mod1wavetype = getRadioVal(mod1wavetypeRadio);
        var LFOmodtype = getRadioVal(LFOmodtypeRadio);
        var LFOwavetype = getRadioVal(LFOwavetypeRadio);
        var mod3type = getRadioVal(mod3typeRadio);
        var mod3wavetype = getRadioVal(mod3wavetypeRadio);
        var osc1type = getRadioVal(osc1typeRadio);
        var osc2type = getRadioVal(osc2typeRadio);
        var osc3type = getRadioVal(osc3typeRadio);

        engineNodes = []; //keep track of all nodes in this particular instance of the engine

        engineOscs = []; //keep track of oscillators for envelope purposes

        engineGain = audioCtx.createGain();

        //create mod oscs and mod gain nodes  
        if (mod1type != "OFF") {
            mod1 = audioCtx.createOscillator();
            mod1.frequency.value = mod1freq;
            mod1.type = mod1wavetype;

            mod1gain = audioCtx.createGain();
            engineNodes.push(mod1, mod1gain);
            engineOscs.push(mod1);

            console.log("mod1 created");
        }
        if (LFOmodtype != "OFF") {
            LFO = audioCtx.createOscillator();
            LFO.frequency.value = LFOfreq;
            LFO.type = LFOwavetype;

            LFOgain = audioCtx.createGain();
            engineNodes.push(LFO, LFOgain);
            engineOscs.push(LFO);
            console.log("LFO created");
        }
        if (mod3type != "OFF") {
            mod3 = audioCtx.createOscillator();
            mod3.frequency.value = mod3freq;
            mod3.type = mod3wavetype;

            mod3gain = audioCtx.createGain();
            engineNodes.push(mod3, mod3gain);
            engineOscs.push(mod3);
            console.log("mod3 created");
        }

        //create oscs and osc gain nodes
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const osc3 = audioCtx.createOscillator();


        osc1.frequency.value = keyboardFrequencyMap[key] *Math.pow(2.0, osc1freq); //slider from [-2, 2] so from two octaves below to two octaves above
        osc2.frequency.value = keyboardFrequencyMap[key] * Math.pow(2.0, osc2freq);
        osc3.frequency.value = keyboardFrequencyMap[key] * Math.pow(2.0, osc3freq);

        console.log(key, osc3.frequency.value);



        osc1.type = osc1type;
        osc2.type = osc2type;
        osc3.type = osc3type;

        const osc1gain = audioCtx.createGain();
        const osc2gain = audioCtx.createGain();
        const osc3gain = audioCtx.createGain();

        osc1gain.gain.value = osc1mix;
        osc2gain.gain.value = osc2mix;
        osc3gain.gain.value = osc3mix;

        engineNodes.push(osc1, osc2, osc3);
        engineNodes.push(osc1gain, osc2gain, osc3gain);
        engineOscs.push(osc1, osc2, osc3);

        //set modulation gains according to am/fm
        if (mod1type == "AM") {
            mod1gain.gain.value = mod1index;
        }
        else if (mod1type == "FM")
            mod1gain.gain.value = (mod1index + 0.5) * 1000; //scale from [-0.5, 0.5] to [0, 1000]

        if (LFOmodtype == "AM")
            LFOgain.gain.value = LFOindex;
        else if (LFOmodtype == "FM")
            LFOgain.gain.value = (LFOindex + 0.5) * 1000;

        if (mod3type == "AM")
            mod3gain.gain.value = mod3index;
        else if (mod3type == "FM")
            mod3gain.gain.value = (mod3index + 0.5) * 1000;


        //connect according to am/fm
        if (mod1type == "AM") {
            mod1modulated = connectAM(mod1, mod1gain, osc1, osc1gain, engineGain);
            engineNodes.push(mod1modulated);
            
        }
        else if (mod1type == "FM")
            connectFM(mod1, mod1gain, osc1, osc1gain, engineGain);

        else if (mod1type == "OFF")
            osc1.connect(osc1gain).connect(engineGain);

        if (LFOmodtype == "AM") {
            LFOmodulated = connectAM(LFO, LFOgain, osc2, osc2gain, engineGain);
            engineNodes.push(LFOmodulated);
        }
        else if (LFOmodtype == "FM")
            connectFM(LFO, LFOgain, osc2, osc2gain, engineGain);

        else if (LFOmodtype == "OFF")
            osc2.connect(osc2gain).connect(engineGain);

        if (mod3type == "AM") {
            mod3modulated = connectAM(mod3, mod3gain, osc3, osc3gain, engineGain);
            engineNodes.push(mod3modulated);
        }
        else if (mod3type == "FM")
            connectFM(mod3, mod3gain, osc3, osc3gain, engineGain);

        else if (mod3type == "OFF")
            osc3.connect(osc3gain).connect(engineGain);

        engineGain.connect(globalGain).connect(audioCtx.destination);

        //add engine to list of active engines
        activeEngines[key] = engineNodes;
        activeEngineOscs[key] = engineOscs;
        activeEngineGains[key] = engineGain;

        //activate envelope
        startEnv(engineOscs, engineGain); 
    }


    //connect AM style; will need to create a new inbetween gain node  
    function connectAM(modulator, modgain, osc, oscgain, eGain) {
        //new inbetween gain node  
        modulated = audioCtx.createGain();
        modulated.gain.value = 0.5;

        modulator.connect(modgain).connect(modulated.gain); //connect index to in bewtween  
        osc.connect(modulated); //connect osc to in between 
        modulated.connect(oscgain).connect(eGain); //connect to other gains

        //******DEBUGGING  
        console.log("AM connected"); 
        return modulated;

 
    }

    //connect FM style
    function connectFM(modulator, modgain, osc, oscgain, eGain) {
        modulator.connect(modgain);
        modgain.connect(osc.frequency);
        osc.connect(oscgain).connect(eGain);

        //*******DEBUGGING    
        console.log("FM connected"); 
    }

    //activate envelope on all oscillators  
    function startEnv(oscillators, eGain) {
        for (osc of oscillators)
            osc.start();
        console.log("oscs started");

        if (clipping.checked == false) {
            num_voices = Object.keys(activeEngineGains).length;
            if (num_voices > 1) {
                mult = 1 / (num_voices + 1);
            }
            else {
                mult = 1;
            }
            console.log(mult);
        }
        else
            mult = 1;

        eGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime); //initialize gain
        eGain.gain.exponentialRampToValueAtTime(0.99 * mult, audioCtx.currentTime + parseFloat(attack)); //do attack       
        eGain.gain.exponentialRampToValueAtTime(sustain * mult, audioCtx.currentTime + parseFloat(attack) + parseFloat(decay)); //do decay to sustain value

    }


    //stop note  
    function stopNote(key) {
        activeEngineGains[key].gain.exponentialRampToValueAtTime(activeEngineGains[key].gain.value, audioCtx.currentTime);
        activeEngineGains[key].gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + parseFloat(release)); //do release part of envelope
        setTimeout(function () {
            for (osc of activeEngineOscs[key])
                osc.stop();
            for (node of activeEngines[key])
                delete node;
            delete activeEngines[key];
            delete activeEngineOscs[key];
            delete activeEngineGains[key];
            console.log("oscs stopped");
            console.log(Object.keys(activeEngines).length);
        }, parseFloat(release)*1000 + 10); //after release length + .01sec, stop oscs and remove all nodes in the Engine
        
    }




    ////////OTHER FUNCTIONS.........


    //value grabbing, etc. 

    //get value of radio element (modtypes, wavetypes, etc.)
    function getRadioVal(radioname) {
        var n = radioname.length;
        for (var i = 0; i < n; i++) {
            if (radioname[i].checked)
                return radioname[i].value;     
        }
        return null; 

    }

    //display value of slider element (frequencies, indexes, etc.)...
    function displaySliderVal(slidername) {
        var val = document.getElementById(slidername).value;
        var output = slidername + "display";
        document.getElementById(output).innerHTML = val;
    }

    //get value of slider element...
    function getSliderVal(slidername) {
        return parseFloat(document.getElementById(slidername).value);
    }



    function changeVolume(event) {
        globalGain.gain.value = volume.value;
        console.log(volume.value);
    }


}); 
