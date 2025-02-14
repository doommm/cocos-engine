/****************************************************************************
 Copyright (c) 2020-2022 Xiamen Yaji Software Co., Ltd.

 http://www.cocos.com

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
 worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
 not use Cocos Creator software for developing other software or tools that's
 used for developing games. You are not granted to publish, distribute,
 sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
****************************************************************************/

#include "VKInputAssembler.h"
#include "VKBuffer.h"
#include "VKCommands.h"
#include "VKDevice.h"

namespace cc {
namespace gfx {

CCVKInputAssembler::CCVKInputAssembler() {
    _typedID = generateObjectID<decltype(this)>();
}

CCVKInputAssembler::~CCVKInputAssembler() {
    destroy();
}

void CCVKInputAssembler::doInit(const InputAssemblerInfo &info) {
    size_t vbCount = _vertexBuffers.size();

    _gpuInputAssembler = ccnew CCVKGPUInputAssembler;
    _gpuInputAssembler->attributes = _attributes;
    _gpuInputAssembler->gpuVertexBuffers.resize(vbCount);

    auto *hub = CCVKDevice::getInstance()->gpuIAHub();
    for (size_t i = 0U; i < vbCount; ++i) {
        auto *vb = static_cast<CCVKBuffer *>(_vertexBuffers[i]);
        _gpuInputAssembler->gpuVertexBuffers[i] = vb->gpuBufferView();
        hub->connect(_gpuInputAssembler, _gpuInputAssembler->gpuVertexBuffers[i].get());
    }

    if (info.indexBuffer) {
        _gpuInputAssembler->gpuIndexBuffer = static_cast<CCVKBuffer *>(info.indexBuffer)->gpuBufferView();
        hub->connect(_gpuInputAssembler, _gpuInputAssembler->gpuIndexBuffer.get());
    }

    if (info.indirectBuffer) {
        _gpuInputAssembler->gpuIndirectBuffer = static_cast<CCVKBuffer *>(info.indirectBuffer)->gpuBufferView();
        hub->connect(_gpuInputAssembler, _gpuInputAssembler->gpuIndirectBuffer.get());
    }

    _gpuInputAssembler->vertexBuffers.resize(vbCount);
    _gpuInputAssembler->vertexBufferOffsets.resize(vbCount);

    CCVKGPUDevice *gpuDevice = CCVKDevice::getInstance()->gpuDevice();
    for (size_t i = 0U; i < vbCount; i++) {
        _gpuInputAssembler->vertexBuffers[i] = _gpuInputAssembler->gpuVertexBuffers[i]->gpuBuffer->vkBuffer;
        _gpuInputAssembler->vertexBufferOffsets[i] = _gpuInputAssembler->gpuVertexBuffers[i]->getStartOffset(gpuDevice->curBackBufferIndex);
    }
}

void CCVKInputAssembler::doDestroy() {
    _gpuInputAssembler = nullptr;
}

void CCVKGPUInputAssembler::shutdown() {
    auto *hub = CCVKDevice::getInstance()->gpuIAHub();
    for (auto& vb : gpuVertexBuffers) {
        hub->disengage(this, vb);
    }
    if (gpuIndexBuffer) {
        hub->disengage(this, gpuIndexBuffer);
    }
    if (gpuIndirectBuffer) {
        hub->disengage(this, gpuIndirectBuffer);
    }
}

void CCVKGPUInputAssembler::update(const CCVKGPUBufferView *oldBuffer, const CCVKGPUBufferView *newBuffer) {
    for (uint32_t i = 0; i < gpuVertexBuffers.size(); ++i) {
        if (gpuVertexBuffers[i].get() == oldBuffer) {
            gpuVertexBuffers[i] = newBuffer;
            vertexBuffers[i] = newBuffer->gpuBuffer->vkBuffer;
        }
    }
    if (gpuIndexBuffer.get() == oldBuffer) {
        gpuIndexBuffer = newBuffer;
    }
    if (gpuIndirectBuffer.get() == oldBuffer) {
        gpuIndirectBuffer = newBuffer;
    }
}

} // namespace gfx
} // namespace cc
