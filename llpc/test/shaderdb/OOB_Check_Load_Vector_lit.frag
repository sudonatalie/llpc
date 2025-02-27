// This test checks if load access to a vector using a runtime index
// will be transformed to an out of bounds checks against the vector bounds, moving the load into a conditionally executed BB.
// The OOB check will possibly zero out the load results.

// BEGIN_SHADERTEST
/*
; RUN: amdllpc -spvgen-dir=%spvgendir% -v %gfxip %s -enable-scratch-bounds-checks | FileCheck -check-prefix=SHADERTEST %s
; SHADERTEST-LABEL: {{^// LLPC}} SPIRV-to-LLVM translation results
; SHADERTEST: .[[entry:[a-z0-9]+]]:
; SHADERTEST: %[[arr:[0-9]+]] = alloca <4 x float>, align 16, addrspace(5)
; SHADERTEST: load i32, i32 addrspace(7)* getelementptr inbounds (<{ i32 }>, <{ i32 }> addrspace(7)* @2, i32 0, i32 0), align 4
; SHADERTEST: %[[idx:[0-9]+]] = add i32 %{{.*}}, 2048
; SHADERTEST: %[[gep:[0-9]+]] = getelementptr <4 x float>, <4 x float> addrspace(5)* %[[arr]], i32 0, i32 %[[idx]]
; SHADERTEST-NEXT: %[[cmp:[0-9]+]] = icmp ult i32 %[[idx]], 4
; SHADERTEST-NEXT: br i1 %[[cmp]], label %{{.*}}, label %{{.*}}
; SHADERTEST: [[load:[a-z0-9]+]]:
; SHADERTEST: %[[loadResult:[0-9]+]] = load float, float addrspace(5)* %[[gep]], align 4
; SHADERTEST: [[final:[a-z0-9]+]]:
; SHADERTEST: %{{.*}} = phi float [ 0.000000e+00, %.[[entry]] ], [ %[[loadResult]], %[[load]] ]

; SHADERTEST: AMDLLPC SUCCESS
*/
// END_SHADERTEST

#version 450 core

layout (location = 0) in vec4 inColor;
layout (location = 0) out vec4 outFragColor;
layout (binding = 0) uniform Constant { int array_index; } c;

void main() {
  vec4 data;
  outFragColor = inColor * vec4(data[c.array_index + 2048]);
}
