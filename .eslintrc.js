module.exports = {
    extends: [
        'airbnb',
        'plugin:import/typescript',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
        'prettier/flowtype',
        'prettier/react',
        'prettier/standard',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        // 允许在未声明前使用
        'no-use-before-define': 0,
        // 禁用文件后缀检测
        'import/extensions': 0,
        // tsx jsx 文件可以包含 jsx语法
        'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.jsx'] }],
        // react props 支持解构
        'react/jsx-props-no-spreading': 0,
        // 支持 console
        'no-console': 0,
        // 只有一个导出时 支持一个命名导出
        'import/prefer-default-export': 0,
        // 允许位运算
        'no-bitwise': 0,
        // react prop state 允许不解构使用
        'react/destructuring-assignment': 0,
        // 缩进4个space
        // eslint-disable-next-line @typescript-eslint/naming-convention
        indent: [2, 4, { SwitchCase: 1 }],
        // 禁用组件方法排序
        'react/sort-comp': 0,
        // 允许非纯函数组件
        'react/prefer-stateless-function': 0,
        // 允许自由使用 _
        'no-underscore-dangle': 0,
        // 允许赋值作为返回结果
        'no-return-assign': 0,
        // 允许非驼峰命名
        camelcase: 0,
        // 允许方法中不存在this
        'class-methods-use-this': 0,

        'no-shadow': 0,
        // 禁用无用构造函数检测
        'no-useless-constructor': 0,
        // 暂时禁用循环依赖 TODO 后续要删除
        'import/no-cycle': 0,
        // 暂时禁用 no-plusplus TODO 后续要删除
        'no-plusplus': 0,
        // 暂时禁用 后续删除
        'import/no-extraneous-dependencies': 0,

        'no-restricted-syntax': [2, 'WithStatement', "BinaryExpression[operator='in']"],
        // 允许使用 continue
        'no-continue': 0,
        // 允许使用强制非空断言
        '@typescript-eslint/no-non-null-assertion': 0,

        '@typescript-eslint/naming-convention': [
            2,
            // class, interface, typeAlias, enum, typeParameter 以形式PascalCase命名
            {
                selector: 'typeLike',
                format: ['PascalCase'],
            },
            // 枚举以EN_作为前缀 并且全部大写
            {
                selector: 'enum',
                format: ['UPPER_CASE'],
                prefix: ['EN_'],
            },
            // 枚举成员全部大写
            {
                selector: 'enumMember',
                format: ['UPPER_CASE'],
            },
            // 接口以I作为前缀
            {
                selector: 'interface',
                format: ['PascalCase'],
                prefix: ['I'],
            },
            // public 成员变量 使用驼峰
            {
                selector: 'memberLike',
                format: ['camelCase'],
                modifiers: ['public'],
            },
            // private 成员变量 前缀 _ 并使用驼峰
            {
                selector: 'memberLike',
                format: ['camelCase'],
                modifiers: ['private'],
                leadingUnderscore: 'require',
            },
            // private static readonly 全大写
            {
                selector: 'memberLike',
                format: ['UPPER_CASE'],
                modifiers: ['private', 'static', 'readonly'],
                leadingUnderscore: 'allow',
            },
            // protected static readonly 全大写
            {
                selector: 'memberLike',
                format: ['UPPER_CASE'],
                modifiers: ['protected', 'static', 'readonly'],
                leadingUnderscore: 'allow',
            },
            // public static readonly 全大写
            {
                selector: 'memberLike',
                format: ['UPPER_CASE'],
                modifiers: ['public', 'static', 'readonly'],
                leadingUnderscore: 'allow',
            },
            // 计算属性 以CALC_作为前缀 并 以PascalCase命名
            {
                selector: 'property',
                format: ['PascalCase'],
                filter: {
                    regex: 'CALC_',
                    match: true,
                },
                prefix: ['CALC_'],
            },
            // 计算属性访问修饰符号 以CALC_作为前缀 并 以PascalCase命名
            {
                selector: 'accessor',
                format: ['PascalCase'],
                filter: {
                    regex: 'CALC_',
                    match: true,
                },
                prefix: ['CALC_'],
            },
        ],

        // 成员变量命名排序
        '@typescript-eslint/member-ordering': [
            2,
            {
                default: {
                    memberTypes: [
                        'signature',

                        'public-static-field',
                        'protected-static-field',
                        'private-static-field',
                        'public-instance-field',
                        'protected-instance-field',
                        'private-instance-field',
                        'public-abstract-field',
                        'protected-abstract-field',
                        'private-abstract-field',

                        'public-constructor',
                        'protected-constructor',
                        'private-constructor',

                        'public-static-method',
                        'protected-static-method',
                        'private-static-method',
                        'public-instance-method',
                        'protected-instance-method',
                        'private-instance-method',
                        'public-abstract-method',
                        'protected-abstract-method',
                        'private-abstract-method',
                    ],
                },
            },
        ],

        /** 未使用的变量作为错误处理 */
        '@typescript-eslint/no-unused-vars': ['off'],
    },
    env: {
        browser: true,
        node: true,
        jasmine: true,
        jest: true,
        es6: true,
    },
};
