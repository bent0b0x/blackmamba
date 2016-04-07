angular.module('app.directives', [])

.directive('fbThumbnail', function(Facebook, store){
  return {
    restrict: 'A',
    link: function ($scope, element, attrs) {
      if (!$scope.friend || !$scope.friend.id) {
        return;
      }
      Facebook.api('/' + $scope.friend.id + '/picture' +
          '?access_token=' +
          store.get('fb_access_token') +
          '&type=normal',
        function (response) {
          if (!response.error) {
            element.append('<img src="' + response.data.url + '"></img>');
          }
        }
      );

    }
  };
})

.directive('selectOnClick', ['$window', function ($window) {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      element.on('click', function () {
          if (!$window.getSelection().toString()) {
              // Required for mobile Safari
              this.setSelectionRange(0, this.value.length);
          }
      });
    }
  };
}])

.directive('endGame', function (socket, $state, $ionicPopup) {
  return {
    restrict: 'E',
    template: '<button ng-disabled="!Game.started" ng-if="Game.isCreator" class="button button-block button-assertive">End Game</button>',
    link: function (scope, element, attrs) {
      element.on('click', function () {
        if (scope.Game.started) {
          $ionicPopup.show({
            title: "Are you sure?",
            buttons: [
              {
                text: '<b>Yes</b>',
                type: 'button button-block button-calm',
                onTap: function () {
                  socket.emit('endGame', scope.Game.game.id);
                }
              },

              {
                text: '<b>No</b>',
                type: 'button button-block button-calm'
              }
            ]
          });
        }
      });
    }
  };
})

.directive('optionDisplay', function () {
  return {
    restrict: 'A',
    link: function (scope, elem, attrs) {
      $(elem).hide();

      scope.$watch('Game.game.current_round', function() {
        if (scope.Game.isReader) {
          $(elem).show();
        }
      });

      scope.$watch('Game.game.current_round.topic', function () {
        if (scope.Game.game.current_round.topic.length) {
          $(elem).hide();
        }
      });
    }
  };
})

.directive('topicOptions', function ($ionicPopup, ionicToast) {
  return {
    restrict: 'E',
    template: '<button class="button button-block button-calm " id="topicOptions">Options</button>',
    link: function (scope, elem, attrs) {
      elem.on('click', function () {
        $ionicPopup.show({
          title: "Topic Options",
          scope: scope,
          buttons: [
            {
              text: 'Random Topic',
              type: 'button button-block button-calm',
              onTap: function (e) {
                if (!scope.saved_topics.all.length) {
                  ionicToast.show("No topics to choose from...", 'top', false, 2500);
                } else {
                  scope.getRandomTopic();
                }
              }
            },
            {
              text: 'Saved Topics',
              type: 'button button-block button-calm',
              onTap: function (e) {
                if (!scope.Game.saved_topics.userTopics.length) {
                  ionicToast.show("You have not saved any Topics", 'top', false, 2500);
                } else {
                  scope.getUsersTopics();
                }
              }
            },
            {
              text: 'Back',
              type: 'button button-block button-calm'
            }
          ]
        });
      });
    }
  };
})

.directive('shareTopic', function ($ionicPopup, ionicToast, $cordovaFacebook) {
  return {
    restrict: 'E',
    template: 
      '<div ng-if="Game.game.current_round.topic.length && !Game.game.winner"' +
        '<button class="button share">' +
          '<i class="icon ion-social-facebook"></i>' +
        '</button>' +
      '</div>',
    link: function (scope, elem, attrs) {
      elem.on('click', function () {
        $ionicPopup.show({
          title: "Share topic to FB?",
          scope: scope,
          buttons: [
            {
              text: 'Yes',
              type: 'button button-block button-calm',
              onTap: function (e) {
                var topic = scope.Game.game.current_round.topic.trim();
                console.log(topic);
                $cordovaFacebook.showDialog({
                  method: "feed",
                  message: topic
                })
                .then(function (success) {
                  console.log(success);
                }, function (error) {
                  console.log(error);
                });

              }
            },
            {
              text: 'No',
              type: 'button button-block button-calm'
            }
          ]
        })
      })
    }
  }
});
