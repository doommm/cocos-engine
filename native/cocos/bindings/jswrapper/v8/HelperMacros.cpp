/****************************************************************************
 Copyright (c) 2021-2022 Xiamen Yaji Software Co., Ltd.

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

#include "HelperMacros.h"
#include "../State.h"
#include "ScriptEngine.h"
#include "Utils.h"
#include "Object.h"
#include "../ValueArrayPool.h"

#if defined(RECORD_JSB_INVOKING)

namespace {
bool cmp(const std::pair<const char *, std::tuple<int, uint64_t>> &a, const std::pair<const char *, std::tuple<int, uint64_t>> &b) {
    return std::get<1>(a.second) > std::get<1>(b.second);
}
unsigned int __jsbInvocationCount;                                                         // NOLINT(readability-identifier-naming)
ccstd::unordered_map<char const *, std::tuple<int, uint64_t>> __jsbFunctionInvokedRecords; // NOLINT(readability-identifier-naming)
} // namespace

JsbInvokeScopeT::JsbInvokeScopeT(const char *functionName) : _functionName(functionName) {
    _start = std::chrono::high_resolution_clock::now();
    __jsbInvocationCount++;
}
JsbInvokeScopeT::~JsbInvokeScopeT() {
    auto &ref = __jsbFunctionInvokedRecords[_functionName];
    std::get<0>(ref) += 1;
    std::get<1>(ref) += std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::high_resolution_clock::now() - _start).count();
}

#endif

void printJSBInvokeAtFrame(int n) {
#if defined(RECORD_JSB_INVOKING)
    static int cnt = 0;
    cnt += 1;
    if (cnt % n == 0) {
        printJSBInvoke();
    }
#endif
}

void clearRecordJSBInvoke() {
#if defined(RECORD_JSB_INVOKING)
    __jsbInvocationCount = 0;
    __jsbFunctionInvokedRecords.clear();
#endif
}

void printJSBInvoke() {
#if defined(RECORD_JSB_INVOKING)
    static ccstd::vector<std::pair<const char *, std::tuple<int, uint64_t>>> pairs;
    for (const auto &it : __jsbFunctionInvokedRecords) {
        pairs.emplace_back(it); // NOLINT
    }

    std::sort(pairs.begin(), pairs.end(), cmp);
    cc::Log::logMessage(cc::LogType::KERNEL, cc::LogLevel::LEVEL_DEBUG, "Start print JSB function record info....... %d times", __jsbInvocationCount);
    for (const auto &pair : pairs) {
        cc::Log::logMessage(cc::LogType::KERNEL, cc::LogLevel::LEVEL_DEBUG, "\t%s takes %.3lf ms, invoked %u times,", pair.first, std::get<1>(pair.second) / 1000000.0, std::get<0>(pair.second));
    }
    pairs.clear();
    cc::Log::logMessage(cc::LogType::KERNEL, cc::LogLevel::LEVEL_DEBUG, "End print JSB function record info.......\n");
#endif
}

SE_HOT void jsbFunctionWrapper(const v8::FunctionCallbackInfo<v8::Value> &v8args, se_function_ptr func, const char *funcName) {
    bool ret = false;
    v8::Isolate *isolate = v8args.GetIsolate();
    v8::HandleScope scope(isolate);
    bool needDeleteValueArray{false};
    se::ValueArray &args = se::gValueArrayPool.get(v8args.Length(), needDeleteValueArray);
    se::CallbackDepthGuard depthGuard{args, se::gValueArrayPool._depth, needDeleteValueArray};
    se::internal::jsToSeArgs(v8args, args);
    se::Object *thisObject = se::internal::getPrivate(isolate, v8args.This());
    se::State state(thisObject, args);
    ret = func(state);
    if (!ret) {
        SE_LOGE("[ERROR] Failed to invoke %s\n", funcName);
    }
    se::internal::setReturnValue(state.rval(), v8args);
}

SE_HOT void jsbFinalizeWrapper(se::Object *thisObject, se_function_ptr func, const char *funcName) {
    auto *engine = se::ScriptEngine::getInstance();
    engine->_setGarbageCollecting(true);
    se::State state(thisObject);
    bool ret = func(state);
    if (!ret) {
        SE_LOGE("[ERROR] Failed to invoke %s\n", funcName);
    }
    engine->_setGarbageCollecting(false);
}
SE_HOT void jsbConstructorWrapper(const v8::FunctionCallbackInfo<v8::Value> &v8args, se_function_ptr func, se_finalize_ptr finalizeCb, se::Class *cls, const char *funcName) {
    v8::Isolate *isolate = v8args.GetIsolate();
    v8::HandleScope scope(isolate);
    bool ret = true;
    bool needDeleteValueArray{false};
    se::ValueArray &args = se::gValueArrayPool.get(v8args.Length(), needDeleteValueArray);
    se::CallbackDepthGuard depthGuard{args, se::gValueArrayPool._depth, needDeleteValueArray};
    se::internal::jsToSeArgs(v8args, args);
    se::Object *thisObject = se::Object::_createJSObject(cls, v8args.This());
    thisObject->_setFinalizeCallback(finalizeCb);
    se::State state(thisObject, args);
    ret = func(state);
    if (!ret) {
        SE_LOGE("[ERROR] Failed to invoke %s\n", funcName);
    }
    se::Value property;
    bool found = false;
    found = thisObject->getProperty("_ctor", &property);
    if (found) property.toObject()->call(args, thisObject);
}

SE_HOT void jsbGetterWrapper(const v8::PropertyCallbackInfo<v8::Value> &v8args, se_function_ptr func, const char *funcName) {
    v8::Isolate *isolate = v8args.GetIsolate();
    v8::HandleScope scope(isolate);
    bool ret = true;
    se::Object *thisObject = se::internal::getPrivate(isolate, v8args.This());
    se::State state(thisObject);
    ret = func(state);
    if (!ret) {
        SE_LOGE("[ERROR] Failed to invoke %s\n", funcName);
    }
    se::internal::setReturnValue(state.rval(), v8args);
}

SE_HOT void jsbSetterWrapper(v8::Local<v8::Value> value, const v8::PropertyCallbackInfo<void> &v8args, se_function_ptr func, const char *funcName) {
    v8::Isolate *isolate = v8args.GetIsolate();
    v8::HandleScope scope(isolate);
    bool ret = true;
    se::Object *thisObject = se::internal::getPrivate(isolate, v8args.This());
    bool needDeleteValueArray{false};
    se::ValueArray &args = se::gValueArrayPool.get(1, needDeleteValueArray);
    se::CallbackDepthGuard depthGuard{args, se::gValueArrayPool._depth, needDeleteValueArray};
    se::Value &data{args[0]};
    se::internal::jsToSeValue(isolate, value, &data);
    se::State state(thisObject, args);
    ret = func(state);
    if (!ret) {
        SE_LOGE("[ERROR] Failed to invoke %s\n", funcName);
    }
}
