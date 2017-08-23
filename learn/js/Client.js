var BASE_URL = "http://localhost:8090";
var auth;
var Sites;
var foot;
var RepoResources;

function request( _path, _payload, _callback){
  $.ajax({ url: BASE_URL + _path,
    headers: {
      'Access-Control-Allow-Origin': 'http://projectntk.000webhostapp.com',
      'data': JSON.stringify(_payload)
     }
  })
  .done(function(data){
    _callback(data);
  });
}

var LoginCallback = function(data){
    console.log("Response Code : "+data.code);
    if(data.code === 200 || data.code === 201){
      console.log("Logged in");
      console.log("Fetching vula content...");
      $("form").hide();
      $(".loader").show();
      getMyContent();
      getRepositoryContent();
    }
    else{
      console.log("Error logging in");
    }
}
function Login(username, password){
  auth = {'_username':username, '_password':password};
  request(
    "/login",
    auth,
    LoginCallback
  );
}

var myContentCallBack = function(data){
  console.log("Got Vula content.");
  // console.log(JSON.stringify(data));
  this.Sites = data;
  $(".loader").hide();
  $("#MainView").css("display","none");
  $("#ResourceView").css("display","block");
  getSites();
}
function getMyContent(){
  request(
    "/content/vula",
    auth,
    myContentCallBack
  );
}

var uploadCallBack = function(data){
  console.log("Response : \n"+JSON.stringify(data));
}
function uploadResource(_resource){
   auth.resource = _resource;

  request(
    "/ingest",
    auth,
    uploadCallBack
  );

}


var AssignmentUploadCallBack = function(data){
  console.log("Assignment Uploaded : "+JSON.stringify(data));
}
function uploadAssignment(_assignment){
   auth.assignment = _assignment;
   var course_acron = prompt("Please enter course Acronym e.g HCI for human computer interaction", _assignment.title.split(" ")[0]);

  auth.pid = auth._username+":course-" + course_acron + "-Assignment-"+_assignment.closeTimeString.split(" ")[0].split("-")[2];
  auth.course_acronym = course_acron;
  request(
    "/assignment",
    auth,
    AssignmentUploadCallBack
  );
}

var repositoryContentCallBack = function(data){
  console.log("Fetched repository content.");
  RepoResources = data;
  renderRepositoryContent();
}
function getRepositoryContent(){
  request(
    "/repository/content",
    auth,
    repositoryContentCallBack
  );
}

/*
----------------------------Render views----------------------
*/

function renderRepositoryContent(){
  table = $("#RepoResourceTable");
  $(".yearClass").hide();
  table.html("");

  for(var i = 0; i < RepoResources.length; i++){
    if($("#"+RepoResources[i].label).length == 0)
      table.append("<tr id='"+RepoResources[i].label+"' class='repo-course-folder' name='"+RepoResources[i].label+"'><td ><i class='material-icons' >arrow_right folder</i></td><td class='folder'><span>"+RepoResources[i].label+"</span></td><td>"+RepoResources[i].ownerId+"</td></tr>");
  }

  $(".repo-course-folder").click(function(){
      console.log("Index : "+$(this).attr("name"));
      renderCourse($(this).attr("name"));
  });
}
function renderCourse(course_name){
  $(".yearClass").show();
  $(".yearClass").first().html(course_name);
  table = $("#RepoResourceTable");
  table.html("");

  table.append("<thead class='Repo-Assignments' ></thead>");
  var repo_assignments_classname = ".Repo-Assignments";
  $(repo_assignments_classname).append('<tr class="folder"><td ><i class="material-icons" name="'+repo_assignments_classname+'">arrow_drop_down folder_open</i></td><td >Assignments</td><td></td></tr>');

  table.append("<thead class='Repo-Notes' ></thead>");
  var repo_notes_classname = ".Repo-Notes";
  $(repo_notes_classname).append('<tr class="folder"><td ><i class="material-icons" name="'+repo_notes_classname+'">arrow_drop_down folder_open</i></td><td >Notes and Miscellaneous</td><td></td>/tr>');

  table.append("<thead class='Repo-Exams' ></thead>");
  var repo_exams_classname = ".Repo-Exams";
  $(repo_exams_classname).append('<tr class="folder"><td ><i class="material-icons" name="'+repo_exams_classname+'">arrow_drop_down folder_open</i></td><td >Exams</td><td></td></tr>');

  for(var i = 0; i < RepoResources.length; i++){
    console.log("Course Name : "+ RepoResources[i].pid.split("-")[1]);
    if(RepoResources[i].pid.split("-")[1] === course_name){
      if(RepoResources[i].pid.split("-")[2] === "Assignment"){
        renderFolderContent(RepoResources[i], $(repo_assignments_classname));
      }else if(RepoResources[i].pid.split("-")[2] === "Notes"){
        renderFolderContent(RepoResources[i], $(repo_notes_classname));
      }else{
        renderFolderContent(RepoResources[i], $(repo_exams_classname));
      }
    }
  }

  $(".folder").find("i").html("arrow_right folder");
  table.find("tr").each(function(){
    $(this).parent().children().slice(1).hide();
  });

  $(".folder").click(function(){
    if($(this).parent().find("i").html() === "arrow_drop_down folder_open"){
      $(this).parent().find("i").first().html("arrow_right folder");
      $(this).parent().children().slice(1).hide();
    }else{
      $(this).find("i").first().html("arrow_drop_down folder_open")
      $(this).parent().children().slice(1).show();
    }
  });
}

function renderFolderContent(RepoResource, folder){
  var DataStreams = RepoResource.datastreams[0].objectDatastreams.datastream;
  for(var i = 0;  i < DataStreams.length; i++){
      folder.append("<tr class='repo-folder' ><td ><i class='material-icons' >insert_drive_file</i></td><td><a href='"+getURL(RepoResource.pid,DataStreams[i].dsid)+"'  target='_blank'>"+DataStreams[i].label+"</a></td><td>"+DataStreams[i].mimeType+"</td></tr>");
  }
}

function getURL(pid,dsid){
  return "http://localhost:8085/fedora/objects/"+pid+"/datastreams/"+dsid+"/content";
}

function getSites(){
  $(".course").hide();
  var table = $("#vulaTable");
  foot = $("#vula-button-controlls");
  table.html("");
  for(var i = 0; i < Sites.length; i++){
    table.append("<tr class='site-folder' name='"+i+"'><td ><i class='material-icons' >arrow_right folder</i></td><td class='folder'><span>"+Sites[i].title+"</span></td><td>"+Sites[i].siteOwner.userDisplayName+"</td></tr>");
  }
    $(".site-folder").click(function(){
      $(".course").first().html($(this).find("span").html());
      $(".course").show();
      $("#vula-button-controlls").show();
      getCourseResources($(this).attr("name"));
    });
}

function getCourseResources(i){
  var Resources = Sites[i].mycontent;
  var Assignments = Sites[i].assignments;

  //console.log(JSON.stringify(Assignments));

  var table = $("#vulaTable");
  //foot = $("#vula-button-controlls");
  table.html("");
  table.append(foot);



    for(var j = 0; j < Resources.length; j++){
      if(Resources[j].type === "collection"){

      }else if(Resources[j].type != "collection"){
        var folder_name = Resources[j].container.split("/")[4].toString().replace(' ', '-').replace(' ', '-');
        var folder_classname = "." + folder_name;

        if(folder_classname != "."){
          if(!$(folder_classname).length){
            table.append("<thead class='"+folder_name+"'></thead>");
            $(folder_classname).append('<tr class="folder"><td ><i class="material-icons" name="'+folder_classname+'">arrow_drop_down folder_open</i></td><td >'+folder_name+'</td><td>'+Resources[j].author+'</td><td></td></tr>');
          }
          $(folder_classname).append('<tr class="file"><td ><input name="'+i+','+j+'" type="checkbox"><i class="material-icons" style="text-align:right;">insert_drive_file</i></td><td >'+Resources[j].title+'</td><td>'+Resources[j].author+'</td><td><button class="upload-single button blue">upload</button></td></tr>');
        }else{
          table.append('<tr class="file" ><td ><input  name="'+i+','+j+'" type="checkbox"><i class="material-icons" style="float:left;">insert_drive_file</i></td><td >'+Resources[j].title+'</td><td>'+Resources[j].author+'</td><td><button class="upload-single button blue">upload</button></td></tr>');
        }
      }
    }

  table.append("<thead class='Assignments'></thead>");
  var assignments_classname = ".Assignments";
  $(assignments_classname).append('<tr class="folder"><td ><i class="material-icons" name="Assignments">arrow_drop_down folder_open</i></td><td >Site Assignments</td><td></td><td></td></tr>');

  for(var k = 0; k < Assignments.length; k++){
    $(assignments_classname).append('<tr class="file"><td ><input name="'+i+','+k+',Assignments" type="checkbox"><i class="material-icons" style="text-align:right;">insert_drive_file</i></td><td >'+Assignments[k].title+'</td><td>'+Assignments[k].author+'</td><td><button class="upload-single button blue">upload</button></td></tr>');
  }

  $(".folder").find("i").html("arrow_right folder");
    table.find("input").each(function(){
    $(this).parent().parent().parent().children().slice(1).hide();
    });

  $(".folder").click(function(){
    if($(this).parent().find("i").html() === "arrow_drop_down folder_open"){
      $(this).parent().find("i").first().html("arrow_right folder")
      $(this).parent().children().slice(1).hide();
    }else{
      $(this).find("i").first().html("arrow_drop_down folder_open")
      $(this).parent().children().slice(1).show();
    }
  });
  $(".upload-selected").click(function(){

     $("#vulaTable").find("input").each(function(){
       if($(this).is(":checked")){
        //  console.log("ECHO : " + $(this).attr("name").split(",")[2]);
         if($(this).attr("name").split(",")[2] != "Assignments"){
           var course_acron = prompt("Please enter course Acronym e.g HCI for human computer interaction", Resources[parseInt($(this).attr("name").split(",")[1])].container.split("/")[4].toString());
           auth.course_acronym = course_acron;
           auth.pid = auth._username + ":course-"+course_acron + "-Notes-"+Resources[parseInt($(this).attr("name").split(",")[1])].modifiedDate.substring(0, 4);
           console.log("Course Name : " + auth.course_acronym);
           console.log("Resource Upload : "+ Resources[parseInt($(this).attr("name").split(",")[1])].container.split("/")[4].toString());
           uploadResource(Resources[parseInt($(this).attr("name").split(",")[1])]);
         }else{
           console.log("Assignment Upload : ");
           uploadAssignment(Assignments[parseInt($(this).attr("name").split(",")[1])]);
         }
       }
     });
   });
   $(".select-all").click(function(){
     if($(this).html() === "select all"){
       $(this).html("unselect all");
       $("#vulaTable").find("input").each(function(){
         $(this).prop('checked', true);
       });
     }else{
       $(this).html("select all");
       $("#vulaTable").find("input").each(function(){
         $(this).prop('checked', false);
       });
     }
   });
   $(".upload-single").click(function(){
     if($(this).parent().parent().find("input").attr("name").split(",")[2] != "Assignments"){
       console.log("Resource Upload : ");
       var course_acron = prompt("Please enter course Acronym e.g HCI for human computer interaction", Resources[parseInt($(this).parent().parent().find("input").attr("name").split(",")[1])].container.split("/")[4].toString());
       auth.pid = auth._username +":course-"+ course_acron + "-Notes-"+Resources[parseInt($(this).parent().parent().find("input").attr("name").split(",")[1])].modifiedDate.substring(0, 4);
       auth.course_acronym = course_acron;
       uploadResource(Resources[parseInt($(this).parent().parent().find("input").attr("name").split(",")[1])]);
       console.log("Resource Upload : " + auth.course_acronym);
     }else{
       console.log("Assignment Upload : ");
       uploadAssignment(Assignments[parseInt($(this).parent().parent().find("input").attr("name").split(",")[1])]);
     }
   });
}



$(document).ready(function(){

    $("#loginButton").click(function(){
        Login($(".username").val(),$(".password").val());
    });

    $(".loader").hide();
    $("#FolderView").css("display","none");
    $("#ResourceView").css("display","none");

    $(".path").click(function(){
      if($(this).attr("name") === "sites"){
        getSites();
      }
      if($(this).attr("name") === "course"){
      }
    });

    $(".path2").click(function(){
      if($(this).attr("name") === "course"){
        renderRepositoryContent();
        $(".yearClass").hide();
      }
      if($(this).attr("name") === "year"){
        //alert("in year");
        $(".yearClass").first().show();
      }
    });
});
