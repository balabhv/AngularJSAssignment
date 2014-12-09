/*                                                                            
 Name: Virinchi Balabhadrapatruni                                             
 Email: Virinchi_Balabhadrapatruni@student.uml.edu                            
 UMass Lowell Computer Science, 91.461 GUI Programming I                      
 Date: 12/8/2014                                                               
 Description: JS File created for Assignment #9.
 This file contains all the needed business logic.
 */

"use strict";  // to ensure that all variables are declared before use

// this part of the script was written for the table of games
// the number of the last column sorted, initialized to the date column
var lastSortColumnNo = 3;
// a flag indicating whether the last sort was ascending (true) or descending (false)
var lastSortDescending = false;

// set up AngularJS module, note that name must be the same as that in the 
//    ng-app attribute of the manual bootstrap at the bottom.
var myApp = angular.module('ZeldaApp', []);

// set a constant to the JSON file path
myApp.constant("jsonUrl", "json/listOfZeldaTitles.json");

// add business logic to the table controller
myApp.controller('ZeldaCtrl',
        /** Read JSON data using Ajax - adapted from Pro AngularJS, p. 149.
         *  @param $scope  the standard AngularJS model scope
         *  @param $http   the built-in AngularJS http object containing the get function
         *  @param jsonUrl the app constant containing the JSON file path (defined above)
         */
                function ($scope, $http, jsonUrl) {
                    $scope.jsonData = {};              // initialize an object in the model's scope
                    $http.get(jsonUrl)                // perform the Ajax call
                            .success(function (data) {      // execute this function if the Ajax succeeds
                                $scope.jsonData.data = data;   // set the model's jsonData.data property to the
                            })                               //    data returned by the Ajax call
                            .error(function (error) {      // execute this function if the Ajax fails
                                $scope.jsonData.error = error; // set the model's jsonData.error property to the
                            });                             //    error returned by the Ajax call


                    // set the initial sort field (release date) and sort order (ascending)
                    $scope.sortField = "DOR";
                    $scope.sortDescending = false;

                    /** 
                     *  Sort column clicked in either ascending or descending order.
                     *  Note that this could also be accomplished using the built-in AngularJS orderBy
                     *    filter and manipulating the sort field and reverse parameters.
                     *  Also note that this code could also have been incorporated into the ng-click 
                     *    directives on the table's th elements, but doing it here gave me more central
                     *    control, and I think that this function makes what's going on clearer and 
                     *    therefore easier to maintain.
                     *  @param colNo the number of the column header clicked
                     */
                    $scope.sortColumn = function (colNo) {
                        $scope.sortDescending = lastSortColumnNo === colNo && !lastSortDescending;
                        // true to sort in descending order, false to sort in ascending order
                        // will be false if sorting a new column or last sort was descending
                        if (colNo === 2) {
                            // this is the Name column
                            $scope.sortField = "name";
                        } else if (colNo === 3) {
                            // this is the Date of Release column
                            $scope.sortField = "DOR";
                        } else if (colNo === 4) {
                            // this is the Platform column
                            $scope.sortField = "platform";
                        }
                        // save the sort paramesters for the next click
                        lastSortDescending = $scope.sortDescending;
                        lastSortColumnNo = colNo;
                    };

                    $scope.showImages = true;

                }
        );

// this part of the script was written for the audio player

// set up AngularJS module, note that name must be the same as that in the 
//    ng-app attribute of the div tag with id player in index.html
var myApp2 = angular.module('PlayerApp', []);

// set a constant to the JSON file path
myApp2.constant("jsonUrl", "AudioPlayer/json/songs.json");

// add business logic to the audio player controller
myApp2.controller('PlayerCtrl',
        /** Read JSON data using Ajax - adapted from Pro AngularJS, p. 149.
         *  @param $scope  the standard AngularJS model scope
         *  @param $http   the built-in AngularJS http object containing the get function
         *  @param jsonUrl the app constant containing the JSON file path (defined above)
         */
                function ($scope, $http, jsonUrl) {
                    $scope.jsonData = {};              // initialize an object in the model's scope
                    $http.get(jsonUrl)                // perform the Ajax call
                            .success(function (data) {      // execute this function if the Ajax succeeds
                                $scope.jsonData.data = data;
                                
                                //function to shuffle the input data randomly
                                $scope.shuffle = function (o) {
                                    for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x)
                                        ;
                                    return o;
                                };
                                
                                // shuffle the input and set the initial song
                                $scope.jsonData.data.RECORDS = $scope.shuffle($scope.jsonData.data.RECORDS);
                                $scope.currentSong = $scope.jsonData.data.RECORDS[0].src;
                                $scope.currentSongIndex = 0;
                                $scope.currentSongTitle = $scope.jsonData.data.RECORDS[0].title;
                                
                            })                               
                            .error(function (error) {      // execute this function if the Ajax fails
                                $scope.jsonData.error = error; // set the model's jsonData.error property to the
                            });                             //    error returned by the Ajax call

                    $scope.showSongs = false; // show the playlist

                    // function to toggle the playlist
                    $scope.toggle = function () {
                        $scope.showSongs = !$scope.showSongs;
                    };
                    
                    // default: don't loop the current song
                    $scope.loop = false;

                    // set a listener on the audio tag so that when one song ends,
                    // the next song in the playlist begins automatically.
                    // if loop is true, then the cursor is set to 0, and the
                    // player begins playing
                    angular.element(document).ready(function () {
                        var audio = document.getElementById('audioplayer');
                        audio.addEventListener('ended', function () {
                            if (!$scope.loop) {
                                $scope.nextSong();
                            } else {
                                this.currentTime = 0;
                                this.play();
                            }

                        });
                    });

                    // boolean to make sure that the user double-clicks the previous button
                    // single click returns the cursor to the beginning of the song.
                    $scope.prevClicked = false;

                    // change song when a song is selected from the playlist.
                    $scope.changeSong = function (oneSubmit) {

                        var audio = document.getElementById('audioplayer');
                        audio.setAttribute('src', oneSubmit.src);
                        
                        // get the current song
                        $scope.currentSong = oneSubmit.src;
                        for (var i = 0; i < $scope.jsonData.data.RECORDS.length; i++) {
                            var obj = $scope.jsonData.data.RECORDS[i];
                            if (obj.src === $scope.currentSong) {
                                $scope.currentSongIndex = i;
                                $scope.currentSongTitle = obj.title;
                                console.log('Current Title: ' + $scope.currentSongTitle);
                                break;
                            }
                        }

                        // shuffle the other songs in the list and move the current song to the top
                        var temparr = [];
                        for (var i = 0; i < $scope.jsonData.data.RECORDS.length; i++) {
                            if (i !== $scope.currentSongIndex) {
                                temparr[temparr.length] = $scope.jsonData.data.RECORDS[i];
                            }
                        }
                        temparr = $scope.shuffle(temparr);
                        $scope.jsonData.data.RECORDS[0] = $scope.jsonData.data.RECORDS[$scope.currentSongIndex];
                        for (var i = 1; i < $scope.jsonData.data.RECORDS.length; i++) {
                            $scope.jsonData.data.RECORDS[i] = temparr[i - 1];
                        }

                        $scope.currentSongIndex = 0;

                        audio.play(); 
                        $scope.toggle(); // hide the playlist view
                        $scope.$apply(); // force the UI to reload the song title

                    };

                    // handle the click of the previous button
                    $scope.prevSong = function () {
                        // if playing the first song in the list
                        if ($scope.currentSongIndex === 0) {

                            // return to the beginning
                            var audio = document.getElementById('audioplayer');
                            audio.currentTime = 0;

                            audio.play();

                        } else {
                            if (!$scope.prevClicked) {
                                // if previous is clicked once
                                var audio = document.getElementById('audioplayer');
                                audio.currentTime = 0;
                                $scope.prevClicked = true;
                                window.setTimeout(function () {
                                    // if previous is not clicked again within 500 milliseconds,
                                    // set the boolean back to false
                                    $scope.prevClicked = false;
                                }, 500);
                            } else {
                                // load the previous song in the list.
                                $scope.prevClick = false;
                                $scope.currentSongIndex = $scope.currentSongIndex - 1;

                                var audio = document.getElementById('audioplayer');
                                audio.setAttribute('src', $scope.jsonData.data.RECORDS[$scope.currentSongIndex].src);
                                $scope.currentSong = $scope.jsonData.data.RECORDS[$scope.currentSongIndex].src;
                                $scope.currentSongTitle = $scope.jsonData.data.RECORDS[$scope.currentSongIndex].title;


                                audio.play();

                            }

                        }
                        // force the UI to reload the song title
                        $scope.$apply();

                    };

                    // handle the click of the next button
                    $scope.nextSong = function () {
                        // if the current song is the last song in the playlist
                        if ($scope.currentSongIndex === $scope.jsonData.data.RECORDS.length - 1) {
                            // wrap around to the first song in the playlist
                            $scope.currentSongIndex = 0;

                            var audio = document.getElementById('audioplayer');
                            audio.setAttribute('src', $scope.jsonData.data.RECORDS[$scope.currentSongIndex].src);
                            $scope.currentSong = $scope.jsonData.data.RECORDS[$scope.currentSongIndex].src;
                            $scope.currentSongTitle = $scope.jsonData.data.RECORDS[$scope.currentSongIndex].title;
                            
                            audio.play();

                        } else {
                            // move to the next song in the playlist
                            $scope.currentSongIndex = $scope.currentSongIndex + 1;

                            var audio = document.getElementById('audioplayer');
                            audio.setAttribute('src', $scope.jsonData.data.RECORDS[$scope.currentSongIndex].src);
                            $scope.currentSong = $scope.jsonData.data.RECORDS[$scope.currentSongIndex].src;
                            $scope.currentSongTitle = $scope.jsonData.data.RECORDS[$scope.currentSongIndex].title;
                            console.log('Current Title: ' + $scope.currentSongTitle);

                            audio.play();

                        }
                        // force the UI to reload the song title
                        $scope.$apply();
                    };


                }
        );
        // manually bootstrap the 2nd AngularJS application
        // REQUIRED for multiple apps in the same page
        angular.element(document).ready(function () {
            angular.bootstrap(document.getElementById("tableApp"), ['ZeldaApp']);
        });

