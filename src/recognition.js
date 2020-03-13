var special_characters = ["?", ",", ".", "!", "'", '"', " "];
var timer;
var timeLimit = 0;
var currentTime = 0;
var jsonLocation = 'data/sentences.json';

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition

var recognizing = false;
var recognition = new SpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;


recognition.onresult = function (event) {
  var final = "";
  var interim = "";
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal) {
      final += event.results[i][0].transcript;
    } else {
      interim += event.results[i][0].transcript;
    }
  }
  correct_answer.innerHTML = final;
  interim_answer.innerHTML = interim;
}

recognition.onspeechstart = function (event) {
  timer = setInterval(display_time_block, 41); 
}

function replaceAll(str, searchStr, replaceStr) {
  return str.split(searchStr).join(replaceStr);
}

function recog_start() {
  $("#correct_div").hide();
  $.getJSON(jsonLocation, function(data) {
    var randint = Math.floor(Math.random()*data.sentences.length);
    question.innerHTML = data.sentences[randint];
    timeLimit = 300*data.sentences[randint].length;
    currentTime = timeLimit;
  });
  recognition.start();
  interim_answer.innerHTML = "위 문장을 소리내어 읽어주세요";
  correct_answer.innerHTML = "";
  wrong_answer.innerHTML = "";
}

function display_time_block() {
  console.log(currentTime);
  if(currentTime < 0) {
    clearInterval(timer);
    $("#correct_div").show();
    console.log("time out");
  }
  var time_block_width = 80*currentTime/timeLimit;
  $("#time_block").css('width', time_block_width.toString()+"vw");
  currentTime -= 41;
}

function success() {

}


$('#challenge_mode_button').click(recog_start);