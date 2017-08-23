class Windows{
  constructor(json_data){
    this.HOME_WINDOW_NAME = "home";
    this.COURSES_WINDOW_NAME = "course";
    this.COURSES_YEAR_WINDOW_NAME = "year";
    this._data_ = json_data;
  }

  getCouserContent(){
    var results = '';
    var i = 0;
    var j = 0;
    for(i = 0; i < this._data_.folder_collection.length; i++){
      var opening ='<li><a class="folder" ><i class="material-icons" >arrow_drop_down folder_open</i>';
      opening += this._data_.folder_collection[i].name + '</a><ul>';

      for(j = 0; j < this._data_.folder_collection[i].files.length; j++){
        opening += '<li><a href="'+this._data_.folder_collection[i].files[j].link+'"><i class="material-icons">insert_drive_file</i>'+this._data_.folder_collection[i].files[j].title+'</a></li>';
      }

      opening  += '</ul></li>';
      results += opening;
    }

    return results;
  }

  getCouserFolders(){
    var results = '';
    var i = 0;
    var j = 0;
    for(i = 0; i < this._data_.folder_collection.length; i++){
      var opening ='<li><a class="folder" ><i class="material-icons" >arrow_drop_down folder_open</i><span>';
      opening += this._data_.folder_collection[i].name + '</span></a><ul>';

      for(j = 0; j < this._data_.folder_collection[i].folders.length; j++){
        opening += '<li class="courseYear" id="'+this._data_.folder_collection[i].name+'"><a href="#"><i class="material-icons">arrow_right folder</i><span>'+this._data_.folder_collection[i].folders[j].year+'</span></a></li>';
      }

      opening  += '</ul></li>';
      results += opening;
    }

    return results;
  }
}



$(document).ready(function(){
    $("#HeaderView").hide();
    $("#FolderView").hide();
    //folderClick();
    //getCourseList();
});
