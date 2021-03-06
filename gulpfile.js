'use strict';

var gulp = require('gulp'),
    plumber = require('gulp-plumber'),
    watch = require('gulp-watch'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rigger = require('gulp-rigger'),
    cssmin = require('gulp-clean-css'),
    imagemin = require('gulp-imagemin'),
    pngquant = require('imagemin-pngquant'),
    rimraf = require('rimraf'),
    server = require('browser-sync'),
    runSequence = require('run-sequence').use(gulp),
    reload = server.reload,
    ghPages = require('gulp-gh-pages');

var path = {
  build: {
    html:  'build/',
    js:    'build/js/',
    style: 'build/css/',
    img:   'build/img/',
    fonts: 'build/fonts/'
  },
  src: {
    html:  'source/*.html',
    js:    'source/js/*.js',
    style: 'source/sass/style.scss',
    img:   'source/img/**/*.*',
    fonts: 'source/fonts/**/*.*'
  },
  watch: {
    html:  'source/**/*.html',
    js:    'source/js/**/*.js',
    style: 'source/sass/**/*.scss',
    img:   'source/img/**/*.*',
    fonts: 'source/fonts/**/*.*'
  },
  clean: './build'
};

var config = {
  server: {
    baseDir: './build'
  },
  tunnel: false,
  host: 'localhost',
  port: 9000,
  logPrefix: 'SDN'
};

gulp.task('clean', function (callback) {
  rimraf(path.clean, callback);
});

gulp.task('html:build', function () {
  gulp.src(path.src.html)
    .pipe(rigger())
    .pipe(gulp.dest(path.build.html))
    .pipe(reload({ stream: true }));
});

gulp.task('js:build', function () {
  gulp.src(path.src.js)
    .pipe(rigger())
    .pipe(sourcemaps.init())
    .pipe(rename({ suffix: '.min' }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.js))
    .pipe(reload({ stream: true }))
});

gulp.task('style:build', function () {
  gulp.src(path.src.style)
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 versions'] }) ]))
    .pipe(rename({ suffix: '.min' }))
    .pipe(cssmin())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.style))
    .pipe(reload({ stream: true }));
});

gulp.task('image:build', function () {
  gulp.src(path.src.img)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngquant()],
      interlaced: true
    }))
    .pipe(gulp.dest(path.build.img))
    .pipe(reload({ stream: true }));
});

gulp.task('fonts:build', function() {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts))
});

gulp.task('build', function(callback) {
  runSequence('clean',
    ['html:build', 'js:build', 'style:build', 'fonts:build', 'image:build'],
    callback
  )
});

gulp.task('watch', function(){
  watch([path.watch.html], function(event, callback) {
    gulp.start('html:build');
  });
  watch([path.watch.style], function(event, callback) {
    gulp.start('style:build');
  });
  watch([path.watch.js], function(event, callback) {
    gulp.start('js:build');
  });
  watch([path.watch.img], function(event, callback) {
    gulp.start('image:build');
  });
  watch([path.watch.fonts], function(event, callback) {
    gulp.start('fonts:build');
  });
});

gulp.task('webserver', function() {
  server(config);
});

gulp.task('deploy', function() {
  return gulp.src('./build/**/*')
    .pipe(ghPages());
});

gulp.task('default', function(callback) {
  runSequence(['build', 'webserver', 'watch'],
    callback
  )
});

gulp.task('server', ['webserver', 'watch']);
