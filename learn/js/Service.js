var BASE_URL = "https://projectntk.000webhostapp.com/learn";
var course_list;
var request_complete = false;
var user = "";

var MAIN_VIEW = $("#FolderView");

class Folder {
  constructor(_icon_names, _parentFolder_) {
    this._icons_ = _icon_names;
    this.CLOSED_FOLDER = "arrow_right";
    this.OPEN_FOLDER = "arrow_drop_down";
    this.parentFolder = _parentFolder_;
  }

  updateFolder(){
    if(this._icons_[0] == this.CLOSED_FOLDER){
      this.parentFolder.first().show();
      return this.OPEN_FOLDER + " folder_open";
    }
    else{
      this.parentFolder.first().hide();
      return this.CLOSED_FOLDER + " folder";
    }
  }
}

function folderClick(){
  $(".folder").click(function(){
    var _icons_ = $(this).find("i");
    var parent_folder = $(this).parent().find("ul");
    var _folder_icon = new Folder(_icons_.html().split(" "), parent_folder);
    _icons_.html(_folder_icon.updateFolder());
  });
  $(".courseYear").click(function(){
    var selectedYear = $(this).find("span").html();
    $(".course").first().html($(this).attr("id"));
    $(".year").html(selectedYear);
    $(".year").show();
    getCourseResourceByYear(selectedYear);
  });
  $(".path").click(function(){
    if($(this).attr("name") === "home"){
      var folders = new Windows("<h1>Home:</h1>");
      $(".course").hide();
      $(".year").hide();
    }
    if($(this).attr("name") === "course"){
      getCourseList();
      $(".year").hide();
    }
    else if($(this).attr("name") === "year"){

    }
  });
}


function updateView(data){
  MAIN_VIEW.html(setUpView(data));
  folderClick();
}

function setUpView(_data_){
  var results = '';
  var i = 0;
  var j = 0;
  for(i = 0; i < _data_.folder_collection.length; i++){
    var opening ='<li><a class="folder" ><i class="material-icons" >arrow_drop_down folder_open</i><span>';
    opening += _data_.folder_collection[i].name + '</span></a><ul>';

    for(j = 0; j < _data_.folder_collection[i].folders.length; j++){
      opening += '<li class="'+_data_.folder_collection[i].folders[j].class+'" id="'+_data_.folder_collection[i].name+'"><a href="'+_data_.folder_collection[i].folders[j].url+'"><i class="material-icons">'+_data_.folder_collection[i].folders[j].icon+'</i><span>'+_data_.folder_collection[i].folders[j].title+'</span></a></li>';
    }

    opening  += '</ul></li>';
    results += opening;
  }

  return results;
}

function request(_path, _request_daata,_method){
  $.ajax({
    url: BASE_URL + _path +"?"+_request_daata,
    method: _method
  })
  .done(function(data) {
    updateView(data);
  });
}

function signInCallback(authResult) {
	if (authResult['code']) {
    setCookie("token", authResult['access_token']);
		$('#signInButton').hide();
		$.ajax({ url: 'https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token='+authResult['access_token'],
			headers: {
				'Access-Control-Allow-Origin': 'https://projectntk.000webhostapp.com',
				'Data': authResult['code'],
				'X-Requested-With': 'XMLHttpRequest'
			 }
		})
		.done(function(data){
      $.ajax({ url: 'http://localhost:8080/login',
        headers: {
          'Access-Control-Allow-Origin': 'http://projectntk.000webhostapp.com',
          'Data': authResult['code'],
          'Token': authResult['access_token'],
          'X-Requested-With': 'XMLHttpRequest'
         }
      })
      .done(function(d){
        alert("Sever Response : "+JSON.stringify(d));
      });
		})
		.fail(function(){
			alert("Request Failed");
		});
	}
}


function setCookie(cvalue) {
    var d = new Date();
    d.setTime(d.getTime() + (1 * 24 * 60 * 60 * 1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = "token=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    var name = "token=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
// function checkCookie() {
//     var user = getCookie("token");
//     if (user != "") {
//     } else {
//         user = prompt("Please enter your name:", "");
//         if (user != "" && user != null) {
//             setCookie("token", user, 365);
//         }
//     }
// }

function getCourseList(){
  this.request("/test/data/course_selecttion.json","","GET");
}

function getCourseResourceByYear(year){
  this.request("/test/data/course_by_year.json",year,"GET");
}
