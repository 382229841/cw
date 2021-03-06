var lodash = require('lodash');

module.exports = function (grunt) {
  // 项目配置
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
	
	concurrent: {
      devel: {
        tasks: ['connect:demo', 'watch'],
        options: {
          limit: 2,
          logConcurrentOutput: true
        }
      }
    },
	
	concat:{
		combinea: {
			options: {
				mangle: false, 
			},
			files: {
				'src/<%= pkg.version%>/js/controller/index.js': [
					'src/<%= pkg.version%>/js/service/dataServices.js',
					'src/<%= pkg.version%>/js/service/dataSignService.js',
					'src/<%= pkg.version%>/js/service/dataSignWeixin.js',
					'src/<%= pkg.version%>/js/controller/controller.js'
				]
			}
		},
		css: {
			files: {
			  "src/<%= pkg.version%>/temp/index.css": ["src/<%= pkg.version%>/css/mobile-angular-ui-base.min.css","src/<%= pkg.version%>/css/layout.css","src/<%= pkg.version%>/css/mobiscroll.custom-2.6.2.min.css"]
			}
		}
	},
	uglify: {		
		builda: {
			options: {
				mangle: false, 
			},
			files: {
				'dest/<%= pkg.version%>/js/index.min.js': ['src/<%= pkg.version%>/js/controller/index.js'],
				'dest/<%= pkg.version%>/js/app.min.js': ['src/<%= pkg.version%>/js/app.js'],
			}
		},
		buildb:{
			files: {
				'dest/<%= pkg.version%>/js/agl.min.js': ['src/<%= pkg.version%>/js/lib/angular.min.js'],
			    'dest/<%= pkg.version%>/js/libs.min.js': ['src/<%= pkg.version%>/js/lib/angular-route.min.js',
				'src/<%= pkg.version%>/js/lib/mobile-angular-ui.min.js',
				'src/<%= pkg.version%>/js/lib/mobile-angular-ui.gestures.min.js',
				'src/<%= pkg.version%>/js/lib/jquery/jquery-2.1.1.min.js', 
				'src/<%= pkg.version%>/js/lib/jquery/jquery.sha1.js',
				'src/<%= pkg.version%>/js/lib/jquery/jquery.md5.js',
				'src/<%= pkg.version%>/js/lib/mobiscroll.custom-2.6.2.min.js'
				],
			    'dest/<%= pkg.version%>/js/mains.min.js': ['src/<%= pkg.version%>/js/common.js','src/<%= pkg.version%>/js/index.js']
			}
		}
	},
	copy: {
	  main: {
		files:[
			{expand: true,flatten: false, cwd:'src/<%= pkg.version%>/images',  src: '**', dest: 'dest/<%= pkg.version%>/images/'},
			{expand: true,flatten: false, cwd:'src/<%= pkg.version%>/views',  src: '**', dest: 'dest/<%= pkg.version%>/views/'},
			{expand: true,flatten: true, cwd:'src/<%= pkg.version%>/fonts', src: '**', dest: 'dest/<%= pkg.version%>/fonts/'},
			{expand: true,flatten: true, src: ['src/<%= pkg.version%>/css/*.png','src/<%= pkg.version%>/css/*.jpg'], dest: 'dest/<%= pkg.version%>/css/'}
		],
	  },
	},
	//压缩css
	cssmin: {
		//文件头部输出信息
		options: {
			banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n',
			//美化代码
			beautify: {
				//中文ascii化，非常有用！防止中文乱码的神配置
				ascii_only: true
			},
			report: 'min'
		},
		my_target: {
			files: [
				{
					expand: true,
					//相对路径
					cwd: 'src/<%= pkg.version%>/temp/',
					src: ['*.css', '!*.min.css'],
					dest: 'dest/<%= pkg.version%>/css',
					ext: '.min.css'
				}
			]
		}
	},
	
	watch: {
      all: {
        files: 'src/**/*',
        tasks: ['build']
      }
    },

    connect: {
      demo: {
        options: {
          hostname: '0.0.0.0',
          port: 3000,
          base: ['.', 'src/1.7.0'],
          keepalive: true
        }
      }
    },
	
  });
  
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks("grunt-contrib-concat");  
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-concurrent');
  
  grunt.registerTask('build', [ 'concat:combinea','concat:css','uglify:builda', 'uglify:buildb', 'cssmin','copy']);
  grunt.registerTask('demo', ['concurrent:devel']);
  // 默认任务
  grunt.registerTask('default', ['concat:combinea','concat:css','uglify:builda', 'uglify:buildb', 'cssmin','copy','concurrent:devel']);
}
//http://www.cnblogs.com/artwl/p/3449303.html