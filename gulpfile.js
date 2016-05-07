'use strict';

/**
 * Dependencies
 */
var gulp = require('gulp')
  , sass = require('gulp-sass')
  , sourcemaps = require('gulp-sourcemaps')
  , uglify = require('gulp-uglify')
  , concat = require('gulp-concat')
  , jshint = require('gulp-jshint')
  , stylish = require('jshint-stylish')
  , ngAnnotate = require('gulp-ng-annotate')
  , notify = require('gulp-notify')
  , plumber = require('gulp-plumber')
  , gulpif = require('gulp-if')
  , browserSync = require('browser-sync')
  , nodemon = require('gulp-nodemon')
  , flatten = require('gulp-flatten')
  , del = require('del');

/**
 * Environment
 */
var env = process.env.NODE_ENV || 'development';

/**
 * Paths
 */
var paths = {

  stylesheets: {
      input: './public/stylesheets/**/*.scss'
    , dev: './development/stylesheets/'
    , output: './dist/stylesheets/'
  },

  scripts: {
      input: [
          './public/scripts/main.js'
        , './public/scripts/services/**/*.js'
        , './public/scripts/directives/**/*.js'
        , './public/scripts/controllers/**/*.js'
      ]
    , dev: './development/scripts/'
    , output: './dist/scripts/'
  },

  views: {
    input: './views/*'
  },

  assets: {
      input: './public/assets/*'
    , dev: './development/assets/'
    , output: './dist/assets/'
  },

  bower: {
    css: {
        input: './bower_components/**/*.min.css'
      , dev: './development/stylesheets/vendors/'
      , output: './dist/stylesheets/vendors/'
    },
    js: {
        input: [
            './bower_components/**/*.min.js'
          , './bower_components/angularjs-ordinal-filter/ordinal-browser.js'
        ]
      , dev: './development/scripts/vendors/'
      , output: './dist/scripts/vendors/'
    }
  },

  clean: {
      development: './development/'
    , dist: './dist/'
  },

  cname: {
      input: './CNAME'
    , dist: './dist/'
  },

  deploy: {
    input: './dist/**/*'
  }
}

/**
 * Builds
 */
gulp.task('build:stylesheets', function () {
  return gulp.src(paths.stylesheets.input)
    .pipe(plumber({errorHandler: notify.onError('Error Sass: <%= error.message %>')}))
    .pipe(gulpif(env === 'development', sourcemaps.init()))
    .pipe(gulpif(env === 'development', sass()))
    .pipe(gulpif(env === 'production', sass({outputStyle: 'compressed'})))
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulpif(env === 'development', gulp.dest(paths.stylesheets.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.stylesheets.output)))
    .pipe(notify('Sass Compiled'))
    .pipe(browserSync.stream())
});

gulp.task('build:scripts', function () {
  return gulp.src(paths.scripts.input)
    .pipe(plumber({errorHandler: notify.onError('Error JS: <%= error.message %>')}))
    .pipe(gulpif(env === 'production', jshint('.jshintrc')))
    .pipe(gulpif(env === 'production', jshint.reporter('jshint-stylish')))
    .pipe(gulpif(env === 'development', sourcemaps.init()))
    .pipe(concat('main.js'))
    .pipe(gulpif(env === 'development', sourcemaps.write()))
    .pipe(gulpif(env === 'production', ngAnnotate({single_quotes: true})))
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulpif(env === 'development', gulp.dest(paths.scripts.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.scripts.output)))
    .pipe(notify('JS Compiled'))
    .pipe(browserSync.stream())
});

gulp.task('build:assets', function () {
  return gulp.src(paths.assets.input)
    .pipe(gulpif(env === 'development', gulp.dest(paths.assets.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.assets.output)))
});

/**
 * Server
 */
gulp.task('server:browserSync', function() {
  browserSync({
    port: 4001,
    proxy: "http://localhost:4000",
    files: ["**/*.*"],
    notify: false,
    options: {
      reloadDelay: 50
    }
  });
});
gulp.task('server:nodemon', function (cb) {

	var started = false;
	return nodemon({
    script: 'server.js'
  }).on('start', function () {
		if (!started) {
			cb();
			started = true;
		}
	});

});

 /**
  * Helpers
  */
gulp.task('helper:bowerComponentsCss', function () {
  gulp.src(paths.bower.css.input)
    .pipe(flatten())
    .pipe(gulpif(env === 'development', gulp.dest(paths.bower.css.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.bower.css.output)))
});

gulp.task('helper:bowerComponentsJs', function () {
  gulp.src(paths.bower.js.input)
    .pipe(flatten())
    .pipe(gulpif(env === 'development', gulp.dest(paths.bower.js.dev)))
    .pipe(gulpif(env === 'production', gulp.dest(paths.bower.js.output)))
});

gulp.task('helper:cname', function () {
  return gulp.src(paths.cname.input)
    .pipe(plumber())
    .pipe(gulp.dest(paths.cname.dist))
});

gulp.task('helper:clean', function () {
  del.sync([
    paths.clean.development
  ])

  del.sync([
    paths.clean.dist
  ])
});

gulp.task('helper:watcher', function() {
  gulp.watch(paths.stylesheets.input, ['build:stylesheets']);
  gulp.watch(paths.scripts.input, ['build:scripts']);
  gulp.watch(paths.views.input, [], browserSync.stream());
});

gulp.task('deploy', ['default'], function () {
  return gulp.src(paths.deploy.input);
});

gulp.task('default', [
    'helper:clean'
  , 'build:stylesheets'
  , 'build:scripts'
  , 'build:assets'
  , 'helper:bowerComponentsCss'
  , 'helper:bowerComponentsJs'
  , 'helper:cname'
  , 'server:browserSync'
  , 'server:nodemon'
  , 'helper:watcher'
])
