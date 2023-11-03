### wgsl 使用注释

### 语法
- builtin 用于 main 函数的入参和出参的内置成员变量标识

|  变量名   | 变量作用域  |  输入输出类型  |  值类型  |
|  ----  | ----  | ----  | ----  |
| vertex_index  | vertex | input | u32 |
| instance_index  | vertex | input | u32 |
| position  | vertex | output | vec4<f32> |
|   | fragment | input | vec4<f32> |
| front_facing  | fragment | input | bool |
| frag_depth  | fragment | output | f32 |
| sample_index  | fragment | input | u32 |
| sample_mask  | fragment | input | u32 |
|   | fragment | output | u32 |
| local_invocation_id  | compute | input | vec3<u32> |
| local_invocation_index  | compute | input | u32 |
| global_invocation_id  | compute | input | vec3<u32> |
| workgroup_id  | compute | input | vec3<u32> |
| num_workgroups  | compute | input | vec3<u32> |

- createBindGroupLayout 创建资源组数据的一些描述信息
  - binding: 绑定的索引
  - visibility: 在何种作用域的可见性
  - texture / buffer 的类型
    - texture -> sampleType
    - buffer -> type

- createBindGroup 创建资源组数据
  - layout: 资源布局
    - 当被用于 pipeline 中包含 position（或其他的内置变量） 的 vertex 着色器时使用 pipeline 的 layout
    - 否则使用 bindGroupLayout
  - entries: 用于描述 shader 中需要设置数据的属性的索引，注入数据的缓冲区

- createPipeline 创建渲染管线
  - layout：资源布局
    - 当前 pipeline 中的 vertex 存在内置的 position 或者其他变量时使用 auto
    - 否则使用 bindGroupLayout
  - vertex：顶点着色器
    - module：着色器源码创建
    - entryPoint：入口函数名称
    - buffer：对当前顶点着色器中的成员变量设置 buffer （可选，连续的着色器处理中，只有第一个需要）
  - fragment：片元着色器
    - module：着色器源码创建
    - entryPoint：入口函数名称
    - targets：输出参数的颜色格式，采样次数（1，2，4，8）
    - constants：常量对象（可选）
  - primitive 当前着色器渲染的形状，如果需要在一个画布中处理不同的形状，则需要创建不同的 pipeline
    - topology：形状参数
    - cullMode：遮挡模式
  - depthStencil 深度模板（只在第一组包含内置变量的 vertex/fragment 着色器中使用）
    - depthWriteEnabled: 是否启用深度测试
    - depthCompare：指定深度比较函数
    - format: 格式

