export default { 
  base: './',
  resolve: {
    alias: {
      'three': '/node_modules/three/build/three.module.js',
      'cannon-es': '/node_modules/cannon-es/dist/cannon-es.js',
      'stats.js': '/node_modules/stats.js/build/stats.min.js'
    }
  },
  optimizeDeps: {
    include: ['three', 'cannon-es', 'stats.js']
  }
};
