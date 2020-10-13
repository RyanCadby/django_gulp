import babel from 'gulp-babel';
import gulp from 'gulp';
import browserSync from 'browser-sync';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import sourcemaps from 'gulp-sourcemaps';
import shell from 'gulp-shell';

const server = browserSync.create();

const paths = {
  scripts: {
    src: 'riders/src/scripts/*.js',
    dest: 'riders/static/riders/scripts'
  },
  styles: {
    src: 'riders/src/scss/**/*',
    dest: 'riders/static/riders/css'
  },
  url: {
    dev: 'localhost:8000',
  }
};

// pg_ctl -D /usr/local/var/postgres start
function db_start() {
  const spawn = require('child_process').spawn;
  return spawn('pg_ctl', ['-D ', '/usr/local/var/postgres', 'start'])
      .stderr.on('data', (data) => {
      console.log(`${data}`);
  });
}

// pg_ctl -D /usr/local/var/postgres stop
function db_stop() {
  const spawn = require('child_process').spawn;
  return spawn('pg_ctl', ['-D ', '/usr/local/var/postgres', 'stop'])
      .stderr.on('data', (data) => {
      console.log(`${data}`);
  });
}

// Run the Django development server
function django() {
  const spawn = require('child_process').spawn;
  return spawn('python3', ['manage.py', 'runserver'])
      .stderr.on('data', (data) => {
      console.log(`${data}`);
  });
}
// Run Django hot reload plugin
function hotreload() {
  const spawn = require('child_process').spawn;
  return spawn('python3', ['manage.py', 'livereload'])
      .stderr.on('data', (data) => {
      console.log(`${data}`);
  });
}

function style() {
  return (
      gulp
          .src(paths.styles.src)
          .pipe(sourcemaps.init())
          .pipe(sass())
          .on("error", sass.logError)
          .pipe(postcss([autoprefixer(), cssnano()]))
          .pipe(sourcemaps.write('../maps'))
          .pipe(gulp.dest(paths.styles.dest))
  );
}

function launch(){
    return gulp
    .src('*.js', { read: false })
    .pipe(shell(['open http://localhost:8000']))
}

function scripts() {
  return gulp.src(paths.scripts.src, { sourcemaps: true })
    .pipe(babel())
    .pipe(gulp.dest(paths.scripts.dest));
}

function watch() {
  gulp.watch(paths.styles.src, style);
  gulp.watch(paths.scripts.src, scripts)
}

export const prerun = gulp.series(hotreload);
export const jump = gulp.parallel(django);
export const run = gulp.series(scripts, style, watch);

export const postgres_stop = gulp.series(db_stop);