require('ts-node').register({
	project         : 'test/tsconfig.json',
	compilerOptions : {
		module : 'commonjs',
		types  : [ 'node', 'chrome' ]
	}
});
