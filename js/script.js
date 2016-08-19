var app = angular.module("app", ["ngRoute"]);

/**
 * Función que define la clase JavaScript encargada de realizar la petición AJAX que
 * recuperará los datos haciendo uso de promesas
 */
function RemoteResource($http, $q, baseUrl) {

  // Permite recuperar la información de un seguro mediante una petición GET
  this.get = function(idSeguro) {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: baseUrl + '/datos' + idSeguro + '.json'
    }).success(function(data, status, header, config) {
      defered.resolve(data);
    }).error(function(data, status, header, config) {
      defered.reject(status);
    });

    return promise;
  };

  // Método público que permite recuperar la lista de seguros mediante una petición GET
  this.list = function() {
    var defered = $q.defer();
    var promise = defered.promise;

    $http({
      method: 'GET',
      url: baseUrl + '/listado_seguros.json'
    }).success(function(data, status, header, config) {
      defered.resolve(data);
    }).error(function(data, status, header, config) {
      defered.reject(status);
    });

    return promise;
  };
};

/**
 * Función que define el constructor del provider. Almacenará la URL a la que se pedirán los
 * recursos e invocará el servicio que hará la petición de los mismos cuando se invoque '$get'
 */
function RemoteResourceProvider() {
  var _baseUrl;

  // Método público para configurar el servicio. Se invoca desde el bloque 'config'
  this.setBaseUrl = function(baseUrl) {
    _baseUrl = baseUrl;
  };

  // Método '$get' que es el factory-provider. Define la función de factoría que hará la petición
  this.$get = ['$http', '$q', function($http, $q) {
    return new RemoteResource($http, $q, _baseUrl);
  }];
};

// Se registra el provider
app.provider("remoteResource", RemoteResourceProvider);

// URL donde estarán los recursos. Los datos estarán en la misma ruta que la web
app.constant("baseUrl", ".");

// Configuramos el provider 'remoteResource' que nos servirá para recuperar los recursos
app.config(['baseUrl', 'remoteResourceProvider', function(baseUrl, remoteResourceProvider) {
  remoteResourceProvider.setBaseUrl(baseUrl);
}]);

// Definimos el enrutado
app.config(["$routeProvider", function($routeProvider) {

  $routeProvider.when('/', {
    templateUrl: "main.html",
    controller: "MainController"
  });

  $routeProvider.when('/seguro/listado', {
    templateUrl: "list.html",
    controller: "ListadoSegurosController",
    resolve: {
      // Recuperamos la lista de seguros antes de cargar la página
      seguros: ["remoteResource", function(remoteResource) {
        return remoteResource.list();
      }]
    }
  });

  $routeProvider.when('/seguro/edit/:idSeguro', {
    templateUrl: "detail.html",
    controller: "DetalleSeguroController",
    resolve: {
      // Recuperamos el detalle del seguro antes de cargar la página
      seguro: ["remoteResource", "$route", function(remoteResource, $route) {
        return remoteResource.get($route.current.params.idSeguro);
      }]
    }
  });

  $routeProvider.otherwise({
    redirectTo: '/'
  });
}]);

// URL donde estará el logo
app.value("urlLogo", "img/logo.png");

// Establecemos la URL del logo en el $rootScope para tenerlo disponible desde todas las páginas
app.run(["$rootScope", "urlLogo", function($rootScope, urlLogo) {
  $rootScope.urlLogo = urlLogo;
}]);

// Controlador para la página principal
app.controller("MainController", ["$scope", function($scope) {

}]);

// Definimos un filtro que permita filtrar por texto introducido
app.filter("filteri18n", ["$filter", function($filter) {
  var filterFn = $filter("filter");

  /** Transforma el texto quitando todos los acentos diéresis, etc. **/
  function normalize(texto) {
    texto = texto.replace(/[áàäâ]/g, "a");
    texto = texto.replace(/[éèëê]/g, "e");
    texto = texto.replace(/[íìïî]/g, "i");
    texto = texto.replace(/[óòôö]/g, "o");
    texto = texto.replace(/[úùüü]/g, "u");
    texto = texto.toUpperCase();
    return texto;
  }

  /** Esta función es el comparator en el filter **/
  function comparator(actual, expected) {
      if (normalize(actual).indexOf(normalize(expected)) >= 0) {
        return true;
      } else {
        return false;
      }
  }

  /** Este es realmente el filtro **/
  function filteri18n(array, expression) {

    //Lo único que hace es llamar al filter original pero pasado
    //la nueva función de comparator
    return filterFn(array, expression, comparator)
  }

  return filteri18n;
}]);

// Controlador para la página del listado
app.controller("ListadoSegurosController", ["$scope", "seguros", function($scope, seguros) {
  $scope.seguros = seguros;

  $scope.filtro = {
    nombre: ""
  };
}]);

// Controlador para la página de detalles
app.controller("DetalleSeguroController", ["$scope", "seguro", function($scope, seguro) {
  $scope.seguro = {
    nif:"",
    nombre:"",
    apellido:"",
    edad:undefined,
    sexo:"",
    casado:false,
    numHijos:undefined,
    embarazada:false,
    coberturas: {
      oftalmologia:false,
      dental:false,
      fecundacionInVitro:false
    },
    enfermedades:{
      corazon:false,
      estomacal:false,
      rinyones:false,
      alergia:false,
      nombreAlergia:""
    },
    fechaCreacion:new Date()
  };

  // Definimos las opciones para la etiqueta 'select'
  $scope.sexos = [
    {
      codSexo: "H",
      descripcion: "Hombre"
    },{
      codSexo: "M",
      descripcion: "Mujer"
    }
  ];

  $scope.seguro = seguro;

  // Simulación de funcionalidad de guardar
  $scope.guardar = function() {
    if ($scope.form.$valid) {
      alert("Los datos aqui se habrían enviado al servidor y estarían validados en la parte cliente.");
    }else {
      alert("Hay datos inválidos.");
    }
  }
}]);

// Definición de la directiva que permite usar el widget de Datepicker de jQuery UI
app.directive("jafDatepicker", [function(dateFormat) {
  return {
    restrict: 'A',
    link: function($scope, element, attributes) {

      element.datepicker({
        dateFormat: attributes.jafDatepicker,
        onSelect: function() {
          $(this).trigger('change');
        }
      });
    }
  };
}])
