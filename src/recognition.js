var special_characters = ["?", ",", ".", "!", "'", '"', " "];
var timer;
var question_score;
var in_game_score = 0;
var next_timer;
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
  if (final != "") {
    inputStr = correct_answer.innerHTML+final;
    var indexes = getCorrectStrIndex(inputStr, question.innerHTML);
    correct_answer.innerHTML = question.innerHTML.substring(0,indexes[1]+1);
    wrong_answer.innerHTML = inputStr.substring(indexes[0]+1);
    if (isSuccess(inputStr, question.innerHTML)) {
      success();
    }
  }
  else {
    wrong_answer.innerHTML = "";
  }
  interim_answer.innerHTML = interim;
}

function getCorrectStrIndex(inputStr, targetStr){
/*
  input : inputStr[String], targetStr[String]
  return : last index of string
  description : compare inputStr and targetStr.
                get last index of correct string.
                special characters are ignored.
*/
  var lastCorrectInputStrIndex = -1;
  var lastCorrectTargetStrIndex = -1;
  var isSuccess = true;
  var inputIndex = 0, targetIndex = 0;
  while (inputIndex < inputStr.length && targetIndex < targetStr.length) {
    if (special_characters.includes(inputStr[inputIndex])) {
      inputIndex += 1;
    }
    else if (special_characters.includes(targetStr[targetIndex])) {
      targetIndex += 1;
    }
    else if (inputStr[inputIndex] == targetStr[targetIndex]){
      lastCorrectInputStrIndex = inputIndex;
      lastCorrectTargetStrIndex = targetIndex;
      inputIndex += 1;
      targetIndex += 1;
    }
    else {
      break;
    }
  }
  return [lastCorrectInputStrIndex, lastCorrectTargetStrIndex];
}

function replace_all(inputStr) {
  for(var i=0; i<special_characters.length; i++) {
    inputStr = inputStr.split(special_characters[i]).join("");
  }
  return inputStr;
}

function isSuccess(inputStr, targetStr) {
  inputStr = replace_all(inputStr);
  targetStr = replace_all(targetStr);
  if(inputStr == targetStr){
    return true;
  }
  return false;
}

function reset(){
  $("#correct_div").hide();
  $.getJSON(jsonLocation, function(data) {
    var randint = Math.floor(Math.random()*data.sentences.length);
    question.innerHTML = data.sentences[randint];
    timeLimit = 300*data.sentences[randint].length;
    currentTime = timeLimit;
  });
  interim_answer.innerHTML = "위 문장을 소리내어 읽어주세요";
  correct_answer.innerHTML = "";
  wrong_answer.innerHTML = "";
  $("#time_block").css('width', "80vw");
}

function recog_start() {
  reset();
  recognition.start();
  timer = setInterval(display_time_block, 41);
}

function display_time_block() {
  if(currentTime < 0) {
    clearInterval(timer);
    console.log("time out");
    fail();
  }
  var time_block_width = 80*currentTime/timeLimit;
  $("#time_block").css('width', time_block_width.toString()+"vw");
  currentTime -= 41;
}

function success() {
  console.log("success");
  clearInterval(timer);
  $("#correct_div").show();
  recognition.stop();
  in_game_score += question.innerHTML.length*10;
  current_score.innerHTML = in_game_score;
  setTimeout(next, 1500);
  
}

function fail() {
  recognition.stop();
  console.log("fail");
  final_score.innerHTML = in_game_score + "점";
  $(".game_mode").hide();
  $("#result").show();
}

function next() {
  console.log("next");
  reset();
  recognition.start();
  timer = setInterval(display_time_block, 41);
}

function restart() {
  console.log("restart");
  $("#result").hide();
  $(".game_mode").show();
  reset();
  in_game_score = 0;
  recognition.start();
  timer = setInterval(display_time_block, 41);
}

$('#game_start_button').click(recog_start);
$('#next_problem_button').click(next);
$('#restart_button').click(restart);