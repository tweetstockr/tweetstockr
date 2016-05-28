angular
  .module('tweetstockr')
  .directive('tournamentCountdown', tournamentCountdown);

  function tournamentCountdown() {
    return {
      restrict: 'EAC',
      scope: {
        setStartDate: '@',
        setEndDate: '@',
        expireMessage: '@',
        startMessage: '@',
        formatView: '@',
        setTemplateView: '@',
        consideredCurrentDate: '@',
      },
      replace: true,
      template: '<div><div></div></div>',
      link: function (scope, element) {
        var insertDate = function() {
          scope.setMessageExpired(scope.expireMessage);
          scope.setMessageInitial(scope.startMessage);
            if(angular.isDefined(scope.setStartDate) && angular.isDefined(scope.setEndDate)) {
              params.dateStart = scope.setStartDate;
              params.dateEnd = scope.setEndDate;

              if(angular.isDefined(scope.setTemplateView)) {
                params.templateView =  scope.setTemplateView;
                params.activeCurrentDate = scope.consideredCurrentDate;
              }
            }

            scope.start();
          };

          scope.$watch('setDateEnd', function() {
            insertDate();
          }, true);

          var _end = new Date();
          var _start = new Date();
          var _second = 1000;
          var _minute = _second * 60;
          var _hour = _minute * 60;
          var _day = _hour * 24;

          var params = {
            second:_second,
            minute:_minute,
            hour: _hour,
            day: _day,
            interval: null,
            messageFinal: 'expired!',
            messageInitial: 'please whait...',
            format:'Y-m-d H:i:s',
            dateEnd: null,
            dateStart: null,
            currDate: null,
            templateView: null,
            activeCurrentDate:'false'
          };

          scope.getCurrentStartDate = function() {
            var _dt = new Date();
            var _current = [
              [
                _dt.getFullYear(),
                ((_dt.getMonth()+1) < 10 ? '0' + (_dt.getMonth()+1) : (_dt.getMonth()+1)),
                (_dt.getDate() < 10 ? '0' + _dt.getDate() : _dt.getDate())
              ].join('-'),
              [(_dt.getHours() < 10 ? '0' + _dt.getHours() : _dt.getHours()),
                (_dt.getMinutes() < 10 ? '0' + _dt.getMinutes() : _dt.getMinutes()),
                (_dt.getSeconds() < 10 ? '0' + _dt.getSeconds() : _dt.getSeconds())
              ].join(':')
            ].join(' ');

            return _current;
          }

          scope.setMessageExpired = function(message) {
            params.messageFinal = message;
          };

          scope.setMessageInitial = function(message) {
            params.messageInitial = message;
          };

          scope.setId = function(id) {
            params.id = id;
            scope.viewElement.setAttribute('id', id);
          };

          scope.setDateStarter = function(strDate) {
            params.protype.dateStart = strDate;
          };

          scope.setDateFinal = function(strDate) {
           params.protype.dateEnd = strDate;
          };

          var createElementDate = function(strDate) {
            var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
            var dateArray = reggie.exec(strDate);

            return new Date(
              (+dateArray[1]),
              (+dateArray[2])-1, // Careful, month starts at 0!
              (+dateArray[3]),
              (+dateArray[4]),
              (+dateArray[5]),
              (+dateArray[6])
            );
          };

          scope.remaining = function() {
            if(!params.currDate) {
              if(params.activeCurrentDate == 'true') {
                params.dateStart = (createElementDate(scope.setStartDate).getTime() < createElementDate(scope.getCurrentStartDate()).getTime()) ? scope.getCurrentStartDate() : params.dateStart;
              }

              params.currDate = createElementDate(params.dateStart);
            }

            _start = params.currDate;
            _end = createElementDate(params.dateEnd);

            if(!(_end instanceof Date) || isNaN(_end.valueOf()) ) {
              element[0].innerHTML = 'A data final não foi definida,' + ' adicione uma data conforme o exemplo: yyyy-mm-dd hh:mm:ss!';
              return;
            }

            if(!(_start instanceof Date) || isNaN(_start.valueOf()) ) {
              element[0].innerHTML = 'A data inicial não foi definida,' + ' adicione uma data conforme o exemplo: yyyy-mm-dd hh:mm:ss!';
              return;
            }

            if(!params.currDate) {
              element[0].innerHTML = 'A data inicial é inválida!';
              return;
            }

            params.currDate.setSeconds(params.currDate.getSeconds() + 1);

            var distance = _end - _start;

            if(distance < 0) {
              clearInterval(params.interval);
              element[0].innerHTML = params.messageFinal;
              return;
            }

            var i=0;
            var checkInterval = setInterval(function() {
              if(createElementDate(scope.getCurrentStartDate()).getTime() < createElementDate(scope.setStartDate).getTime()) {
                element[0].innerHTML = params.messageInitial;
                return;
              } else {
                clearInterval(checkInterval);
              }
            },1);

            var days = Math.floor(distance / params.day);
            var hours = Math.floor((distance % params.day) / params.hour);
            var minutes = Math.floor((distance % params.hour) / params.minute);
            var seconds = Math.floor((distance % params.minute) / params.second);
            var elementsTime = [];

            elementsTime[0] =((days < 10) ? '0' : '') + days;
            elementsTime[1] =((hours < 10) ? '0' : '') + hours;
            elementsTime[2] =((minutes < 10) ? '0' : '') + minutes;
            elementsTime[3] =((seconds < 10) ? '0' : '') + seconds;
            element[0].innerHTML =  scope.setFormatViewTime(elementsTime);
          };

          scope.setFormatViewTime = function(elementsTime) {
            var view = scope.formatView
              .replace(/%d/gi, elementsTime[0])
              .replace(/%h/gi, elementsTime[1])
              .replace(/%i/gi, elementsTime[2])
              .replace(/%s/gi, elementsTime[3]);

            if(angular.isDefined(params.templateView) && params.templateView != null && params.templateView != '') {
              return params.templateView.replace(/%t/gi, view);
            } else {
              return view;
            }
          };

          scope.setFormatDate = function(format) {
            params.format = format;
          };

          scope.start = function () {
            if(!(_end instanceof Date) || isNaN(_end.valueOf()) ) {
              element[0].innerHTML = 'A data final não foi definida, ' + 'adicione uma data conforme o exemplo: yyyy-mm-dd hh:mm:ss!';

              return;
            }

            if(!(_start instanceof Date) || isNaN(_start.valueOf()) ) {
              element[0].innerHTML = 'A data inicial não foi definida, ' + 'adicione uma data conforme o exemplo: yyyy-mm-dd hh:mm:ss!';

              return;
            }

            if(_start > _end) {
              element[0].innerHTML = 'A data inicial não pode ser maior que a data final!';

              return;
            }

            params.interval = setInterval(this.remaining, params.second);
          };
        }
      };
    }
  }
