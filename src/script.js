var special_characters = ["?", ",", ".", "!", "'", '"', " "];
var timer;
var timer2;
var timerValue;
var jsonLocation = 'data/sentences.json';

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition

var recognizing = false;
var recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
reset();
recognition.onend = reset;

recognition.onresult = function (event) {
  var final = "";
  var interim = "";
  for (var i = 0; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      final += event.results[i][0].transcript;
    } else {
      interim += event.results[i][0].transcript;
    }
  }
  var correctStrIndex = getCorrectStrIndex(final, challenge.innerHTML);
  correct_final_span.innerHTML = final.substring(0,correctStrIndex);
  wrong_final_span.innerHTML = final.substring(correctStrIndex)
  interim_span.innerHTML = interim;
  console.log(getCorrectStrIndex(final, challenge.innerHTML));
  if (normalize(final) == normalize(challenge.innerHTML)) {
    correct_sign.innerHTML = "정답";
    clearTimeout(timer);
    clearInterval(timer2);
    recognition.stop();
    reset();
  }
  else if(normalize(interim) == normalize(challenge.innerHTML)){
    correct_sign.innerHTML = "정답?";
  }
  else {
    correct_sign.innerHTML = "땡 : " + getScore(normalize(final), normalize(challenge.innerHTML)) + "%";
  }
}

function reset() {
  recognizing = false;
  button.innerHTML = "Click to Speak";
}

function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

function normalize(str) {
  for (var i = 0; i < special_characters.length; i++ ){
    str = replaceAll(str, special_characters[i], "");
  }
  return str;
}

function getScore(tryStr, targetStr){
  var len = Math.min(tryStr.length, targetStr.length);
  var score = 0;
  for (var i=0; i<len; i++){
    if (tryStr[i] == targetStr[i]){
      score += 1;
    }
  }
  return score/targetStr.length*100;
}

function getCorrectStrIndex(tryStr, targetStr) {
  var len = Math.min(tryStr.length, targetStr.length);
  var correctStr = ""
  var i = 0, j = 0;
  while (i<len && j<len){
    if (tryStr[i] == targetStr[j]) {
      correctStr += tryStr[i];
      i += 1;
      j += 1;
    }
    else if (special_characters.includes(tryStr[i])){
      i += 1;
    }
    else if (special_characters.includes(targetStr[i])){
      j += 1;
    }
    else {
      break;
    }
  }
  return i;
}

function timeover(){
  if (timerValue <= 100) {
    alert("타임 아웃!!!");
  }
  timer_div.innerHTML = "  남은 시간: 0"
  clearInterval(timer2);
  recognition.stop();
  reset();
}

function display_timer(){
  timerValue -= 100;
  timer_div.innerHTML = "  남은 시간: " + ((timerValue-100)/1000) + "초";
}

function toggleStartStop() {
  if (recognizing) {
    clearTimeout(timer);
    clearInterval(timer2);
    recognition.stop();
    reset();
  } else {
    $.getJSON(jsonLocation, function(data){
      var randint = Math.floor(Math.random()*data.sentences.length);
      challenge.innerHTML = data.sentences[randint];
      timerValue = 200*data.sentences[randint].length;
      timer = setTimeout(timeover, timerValue);
      timer2 = setInterval(display_timer, 100);
    });
    recognition.start();
    recognizing = true;
    button.innerHTML = "Click to Stop";
    final_span.innerHTML = "";
    interim_span.innerHTML = "";
    correct_final_span.innerHTML = "";
    wrong_final_span.innerHTML = "";
  }
}