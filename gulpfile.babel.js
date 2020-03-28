import gulp from 'gulp'
import fileInclude from 'gulp-file-include'
import browserSync from 'browser-sync'
import sass from 'gulp-sass'
import cleanCSS from 'gulp-clean-css'
import autoPrefixer from 'gulp-autoprefixer'
import count from 'gulp-count'
import plumber from 'gulp-plumber'
import newer from 'gulp-newer'
import imageMin from 'gulp-imagemin'
import htmlBeautify from 'gulp-html-beautify'
import concat from 'gulp-concat'
import distClean from 'gulp-dest-clean'

const paths = {
  root: {
    src: 'src',
    dist: 'dist',
  },
  styles: {
    file: 'src/assets/css/**/*.scss',
    src: 'src/assets/css',
    dist: 'dist/assets/css',
  },
  scripts: {
    file: 'src/assets/js/**/*',
    src: 'src/assets/js',
    dist: 'dist/assets/js',
  },
  images: {
    file: 'src/assets/images/**/*',
    src: 'src/assets/image',
    dist: 'dist/assets/images',
  },
  html: {
    file: 'src/html/*.html',
    include: 'src/html/include/*.html',
    src: 'src/html',
    dist: 'dist/html',
  },
}

const css = () => {
  return gulp
    .src(paths.styles.file)
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.messageFormatted)
          this.emit('end')
        },
      }),
    )
    .pipe(
      sass({
        outputStyle: 'expanded',
      }).on('error', sass.logError),
    )
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(concat('all.min.css'))
    .pipe(
      autoPrefixer({
        overrideBrowserslist: ['last 3 versions'],
        cascade: false,
      }),
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.styles.dist))
    .pipe(count('<%= counter %> css files'))
}

const script = () => {
  return (
    gulp
      .src(paths.scripts.file)
      .pipe(
        plumber({
          errorHandler: function (err) {
            console.log(err.messageFormatted)
            this.emit('end')
          },
        }),
      )
      // .pipe(babel())
      // .pipe(concat('all.js'))
      // .pipe(uglify({
      //   compress: true,
      //   mangle: true,
      //   output:{
      //     comments: /^!/
      //   }
      // }))
      .pipe(distClean(paths.scripts.dist))
      .pipe(newer(paths.scripts.dist))
      .pipe(gulp.dest(paths.scripts.dist))
      .pipe(count('<%= counter %> js files'))
  )
}

const image = () => {
  return gulp
    .src(paths.images.file)
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.messageFormatted)
          this.emit('end')
        },
      }),
    )
    .pipe(distClean(paths.images.dist))
    .pipe(newer(paths.images.dist))
    .pipe(imageMin())
    .pipe(gulp.dest(paths.images.dist))
    .pipe(count('<%= counter %> image files'))
}

const html = () => {
  return gulp
    .src(paths.html.file)
    .pipe(
      plumber({
        errorHandler: function (err) {
          console.log(err.messageFormatted)
          this.emit('end')
        },
      }),
    )
    .pipe(distClean(paths.html.dist))
    .pipe(newer(paths.html.dist))
    .pipe(fileInclude())
    .pipe(
      htmlBeautify({
        indent_size: 2,
      }),
    )
    .pipe(gulp.dest(paths.html.dist))
    .pipe(count('<%= counter %> html files'))
}

// -- build server task
const server = (done) => {
  return browserSync.init({
    port: 3333,
    server: {
      baseDir: paths.root.dist + '/',
      index: './html/index.html',
    },
  })
  done()
}

const reload = (done) => {
  browserSync.reload()
  done()
}

// -- build watch task
const watch = (done) => {
  gulp.watch([paths.html.file, paths.html.include], gulp.parallel(html, reload))
  gulp.watch([paths.styles.file], gulp.parallel(css, reload))
  gulp.watch([paths.scripts.file], gulp.parallel(script, reload))
  gulp.watch([paths.scripts.file], gulp.parallel(image, reload))
  done()
}

gulp.task(
  'default',
  gulp.series(
    gulp.parallel(html, css, script, image),
    gulp.parallel(server, watch),
  ),
)
