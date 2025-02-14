var wasmDevice = (() => {
    var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;

    return (
        function(wasmDevice) {
            wasmDevice = wasmDevice || {};

            var Module = typeof wasmDevice != "undefined" ? wasmDevice : {};
            var readyPromiseResolve, readyPromiseReject;
            Module["ready"] = new Promise(function(resolve, reject) {
                readyPromiseResolve = resolve;
                readyPromiseReject = reject
            });
            var moduleOverrides = Object.assign({}, Module);
            var arguments_ = [];
            var thisProgram = "./this.program";
            var quit_ = (status, toThrow) => {
                throw toThrow
            };
            var ENVIRONMENT_IS_WEB = true;
            var ENVIRONMENT_IS_WORKER = false;
            var scriptDirectory = "";

            function locateFile(path) {
                if (Module["locateFile"]) {
                    return Module["locateFile"](path, scriptDirectory)
                }
                return scriptDirectory + path
            }
            var read_, readAsync, readBinary, setWindowTitle;
            if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
                if (ENVIRONMENT_IS_WORKER) {
                    scriptDirectory = self.location.href
                } else if (typeof document != "undefined" && document.currentScript) {
                    scriptDirectory = document.currentScript.src
                }
                if (_scriptDir) {
                    scriptDirectory = _scriptDir
                }
                if (scriptDirectory.indexOf("blob:") !== 0) {
                    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1)
                } else {
                    scriptDirectory = ""
                } {
                    read_ = url => {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, false);
                        xhr.send(null);
                        return xhr.responseText
                    };
                    if (ENVIRONMENT_IS_WORKER) {
                        readBinary = url => {
                            var xhr = new XMLHttpRequest;
                            xhr.open("GET", url, false);
                            xhr.responseType = "arraybuffer";
                            xhr.send(null);
                            return new Uint8Array(xhr.response)
                        }
                    }
                    readAsync = (url, onload, onerror) => {
                        var xhr = new XMLHttpRequest;
                        xhr.open("GET", url, true);
                        xhr.responseType = "arraybuffer";
                        xhr.onload = () => {
                            if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                                onload(xhr.response);
                                return
                            }
                            onerror()
                        };
                        xhr.onerror = onerror;
                        xhr.send(null)
                    }
                }
                setWindowTitle = title => document.title = title
            } else {}
            var out = Module["print"] || console.log.bind(console);
            var err = Module["printErr"] || console.warn.bind(console);
            Object.assign(Module, moduleOverrides);
            moduleOverrides = null;
            if (Module["arguments"]) arguments_ = Module["arguments"];
            if (Module["thisProgram"]) thisProgram = Module["thisProgram"];
            if (Module["quit"]) quit_ = Module["quit"];
            var POINTER_SIZE = 4;
            var tempRet0 = 0;
            var setTempRet0 = value => {
                tempRet0 = value
            };
            var wasmBinary;
            if (Module["wasmBinary"]) wasmBinary = Module["wasmBinary"];
            var noExitRuntime = Module["noExitRuntime"] || true;
            if (typeof WebAssembly != "object") {
                abort("no native wasm support detected")
            }
            var wasmMemory;
            var ABORT = false;
            var EXITSTATUS;

            function assert(condition, text) {
                if (!condition) {
                    abort(text)
                }
            }
            var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : undefined;

            function UTF8ArrayToString(heapOrArray, idx, maxBytesToRead) {
                var endIdx = idx + maxBytesToRead;
                var endPtr = idx;
                while (heapOrArray[endPtr] && !(endPtr >= endIdx)) ++endPtr;
                if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
                    return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr))
                }
                var str = "";
                while (idx < endPtr) {
                    var u0 = heapOrArray[idx++];
                    if (!(u0 & 128)) {
                        str += String.fromCharCode(u0);
                        continue
                    }
                    var u1 = heapOrArray[idx++] & 63;
                    if ((u0 & 224) == 192) {
                        str += String.fromCharCode((u0 & 31) << 6 | u1);
                        continue
                    }
                    var u2 = heapOrArray[idx++] & 63;
                    if ((u0 & 240) == 224) {
                        u0 = (u0 & 15) << 12 | u1 << 6 | u2
                    } else {
                        u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63
                    }
                    if (u0 < 65536) {
                        str += String.fromCharCode(u0)
                    } else {
                        var ch = u0 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    }
                }
                return str
            }

            function UTF8ToString(ptr, maxBytesToRead) {
                return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : ""
            }

            function stringToUTF8Array(str, heap, outIdx, maxBytesToWrite) {
                if (!(maxBytesToWrite > 0)) return 0;
                var startIdx = outIdx;
                var endIdx = outIdx + maxBytesToWrite - 1;
                for (var i = 0; i < str.length; ++i) {
                    var u = str.charCodeAt(i);
                    if (u >= 55296 && u <= 57343) {
                        var u1 = str.charCodeAt(++i);
                        u = 65536 + ((u & 1023) << 10) | u1 & 1023
                    }
                    if (u <= 127) {
                        if (outIdx >= endIdx) break;
                        heap[outIdx++] = u
                    } else if (u <= 2047) {
                        if (outIdx + 1 >= endIdx) break;
                        heap[outIdx++] = 192 | u >> 6;
                        heap[outIdx++] = 128 | u & 63
                    } else if (u <= 65535) {
                        if (outIdx + 2 >= endIdx) break;
                        heap[outIdx++] = 224 | u >> 12;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    } else {
                        if (outIdx + 3 >= endIdx) break;
                        heap[outIdx++] = 240 | u >> 18;
                        heap[outIdx++] = 128 | u >> 12 & 63;
                        heap[outIdx++] = 128 | u >> 6 & 63;
                        heap[outIdx++] = 128 | u & 63
                    }
                }
                heap[outIdx] = 0;
                return outIdx - startIdx
            }

            function stringToUTF8(str, outPtr, maxBytesToWrite) {
                return stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite)
            }

            function lengthBytesUTF8(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var c = str.charCodeAt(i);
                    if (c <= 127) {
                        len++
                    } else if (c <= 2047) {
                        len += 2
                    } else if (c >= 55296 && c <= 57343) {
                        len += 4;
                        ++i
                    } else {
                        len += 3
                    }
                }
                return len
            }
            var buffer, HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;

            function updateGlobalBufferAndViews(buf) {
                buffer = buf;
                Module["HEAP8"] = HEAP8 = new Int8Array(buf);
                Module["HEAP16"] = HEAP16 = new Int16Array(buf);
                Module["HEAP32"] = HEAP32 = new Int32Array(buf);
                Module["HEAPU8"] = HEAPU8 = new Uint8Array(buf);
                Module["HEAPU16"] = HEAPU16 = new Uint16Array(buf);
                Module["HEAPU32"] = HEAPU32 = new Uint32Array(buf);
                Module["HEAPF32"] = HEAPF32 = new Float32Array(buf);
                Module["HEAPF64"] = HEAPF64 = new Float64Array(buf)
            }
            var INITIAL_MEMORY = Module["INITIAL_MEMORY"] || 16777216;
            var wasmTable;
            var __ATPRERUN__ = [];
            var __ATINIT__ = [];
            var __ATPOSTRUN__ = [];
            var runtimeInitialized = false;

            function preRun() {
                if (Module["preRun"]) {
                    if (typeof Module["preRun"] == "function") Module["preRun"] = [Module["preRun"]];
                    while (Module["preRun"].length) {
                        addOnPreRun(Module["preRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPRERUN__)
            }

            function initRuntime() {
                runtimeInitialized = true;
                callRuntimeCallbacks(__ATINIT__)
            }

            function postRun() {
                if (Module["postRun"]) {
                    if (typeof Module["postRun"] == "function") Module["postRun"] = [Module["postRun"]];
                    while (Module["postRun"].length) {
                        addOnPostRun(Module["postRun"].shift())
                    }
                }
                callRuntimeCallbacks(__ATPOSTRUN__)
            }

            function addOnPreRun(cb) {
                __ATPRERUN__.unshift(cb)
            }

            function addOnInit(cb) {
                __ATINIT__.unshift(cb)
            }

            function addOnPostRun(cb) {
                __ATPOSTRUN__.unshift(cb)
            }
            var runDependencies = 0;
            var runDependencyWatcher = null;
            var dependenciesFulfilled = null;

            function addRunDependency(id) {
                runDependencies++;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
            }

            function removeRunDependency(id) {
                runDependencies--;
                if (Module["monitorRunDependencies"]) {
                    Module["monitorRunDependencies"](runDependencies)
                }
                if (runDependencies == 0) {
                    if (runDependencyWatcher !== null) {
                        clearInterval(runDependencyWatcher);
                        runDependencyWatcher = null
                    }
                    if (dependenciesFulfilled) {
                        var callback = dependenciesFulfilled;
                        dependenciesFulfilled = null;
                        callback()
                    }
                }
            }

            function abort(what) {
                {
                    if (Module["onAbort"]) {
                        Module["onAbort"](what)
                    }
                }
                what = "Aborted(" + what + ")";
                err(what);
                ABORT = true;
                EXITSTATUS = 1;
                what += ". Build with -sASSERTIONS for more info.";
                var e = new WebAssembly.RuntimeError(what);
                readyPromiseReject(e);
                throw e
            }
            var dataURIPrefix = "data:application/octet-stream;base64,";

            function isDataURI(filename) {
                return filename.startsWith(dataURIPrefix)
            }
            var wasmBinaryFile;
            wasmBinaryFile = "webgpu_wasm.wasm";
            if (!isDataURI(wasmBinaryFile)) {
                wasmBinaryFile = locateFile(wasmBinaryFile)
            }

            function getBinary(file) {
                try {
                    if (file == wasmBinaryFile && wasmBinary) {
                        return new Uint8Array(wasmBinary)
                    }
                    if (readBinary) {
                        return readBinary(file)
                    }
                    throw "both async and sync fetching of the wasm failed"
                } catch (err) {
                    abort(err)
                }
            }

            function getBinaryPromise() {
                if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
                    if (typeof fetch == "function") {
                        return fetch(wasmBinaryFile, {
                            credentials: "same-origin"
                        }).then(function(response) {
                            if (!response["ok"]) {
                                throw "failed to load wasm binary file at '" + wasmBinaryFile + "'"
                            }
                            return response["arrayBuffer"]()
                        }).catch(function() {
                            return getBinary(wasmBinaryFile)
                        })
                    }
                }
                return Promise.resolve().then(function() {
                    return getBinary(wasmBinaryFile)
                })
            }

            function createWasm() {
                var info = {
                    "a": asmLibraryArg
                };

                function receiveInstance(instance, module) {
                    var exports = instance.exports;
                    Module["asm"] = exports;
                    wasmMemory = Module["asm"]["_a"];
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    wasmTable = Module["asm"]["ab"];
                    addOnInit(Module["asm"]["$a"]);
                    removeRunDependency("wasm-instantiate")
                }
                addRunDependency("wasm-instantiate");

                function receiveInstantiationResult(result) {
                    receiveInstance(result["instance"])
                }

                function instantiateArrayBuffer(receiver) {
                    return getBinaryPromise().then(function(binary) {
                        return WebAssembly.instantiate(binary, info)
                    }).then(function(instance) {
                        return instance
                    }).then(receiver, function(reason) {
                        err("failed to asynchronously prepare wasm: " + reason);
                        abort(reason)
                    })
                }

                function instantiateAsync() {
                    if (!wasmBinary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(wasmBinaryFile) && typeof fetch == "function") {
                        return fetch(wasmBinaryFile, {
                            credentials: "same-origin"
                        }).then(function(response) {
                            var result = WebAssembly.instantiateStreaming(response, info);
                            return result.then(receiveInstantiationResult, function(reason) {
                                err("wasm streaming compile failed: " + reason);
                                err("falling back to ArrayBuffer instantiation");
                                return instantiateArrayBuffer(receiveInstantiationResult)
                            })
                        })
                    } else {
                        return instantiateArrayBuffer(receiveInstantiationResult)
                    }
                }
                if (Module["instantiateWasm"]) {
                    try {
                        var exports = Module["instantiateWasm"](info, receiveInstance);
                        return exports
                    } catch (e) {
                        err("Module.instantiateWasm callback failed with error: " + e);
                        return false
                    }
                }
                instantiateAsync().catch(readyPromiseReject);
                return {}
            }

            function ExitStatus(status) {
                this.name = "ExitStatus";
                this.message = "Program terminated with exit(" + status + ")";
                this.status = status
            }

            function callRuntimeCallbacks(callbacks) {
                while (callbacks.length > 0) {
                    callbacks.shift()(Module)
                }
            }

            function handleException(e) {
                if (e instanceof ExitStatus || e == "unwind") {
                    return EXITSTATUS
                }
                quit_(1, e)
            }
            var structRegistrations = {};

            function runDestructors(destructors) {
                while (destructors.length) {
                    var ptr = destructors.pop();
                    var del = destructors.pop();
                    del(ptr)
                }
            }

            function simpleReadValueFromPointer(pointer) {
                return this["fromWireType"](HEAP32[pointer >> 2])
            }
            var awaitingDependencies = {};
            var registeredTypes = {};
            var typeDependencies = {};
            var char_0 = 48;
            var char_9 = 57;

            function makeLegalFunctionName(name) {
                if (undefined === name) {
                    return "_unknown"
                }
                name = name.replace(/[^a-zA-Z0-9_]/g, "$");
                var f = name.charCodeAt(0);
                if (f >= char_0 && f <= char_9) {
                    return "_" + name
                }
                return name
            }

            function createNamedFunction(name, body) {
                name = makeLegalFunctionName(name);
                return new Function("body", "return function " + name + "() {\n" + '    "use strict";' + "    return body.apply(this, arguments);\n" + "};\n")(body)
            }

            function extendError(baseErrorType, errorName) {
                var errorClass = createNamedFunction(errorName, function(message) {
                    this.name = errorName;
                    this.message = message;
                    var stack = new Error(message).stack;
                    if (stack !== undefined) {
                        this.stack = this.toString() + "\n" + stack.replace(/^Error(:[^\n]*)?\n/, "")
                    }
                });
                errorClass.prototype = Object.create(baseErrorType.prototype);
                errorClass.prototype.constructor = errorClass;
                errorClass.prototype.toString = function() {
                    if (this.message === undefined) {
                        return this.name
                    } else {
                        return this.name + ": " + this.message
                    }
                };
                return errorClass
            }
            var InternalError = undefined;

            function throwInternalError(message) {
                throw new InternalError(message)
            }

            function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
                myTypes.forEach(function(type) {
                    typeDependencies[type] = dependentTypes
                });

                function onComplete(typeConverters) {
                    var myTypeConverters = getTypeConverters(typeConverters);
                    if (myTypeConverters.length !== myTypes.length) {
                        throwInternalError("Mismatched type converter count")
                    }
                    for (var i = 0; i < myTypes.length; ++i) {
                        registerType(myTypes[i], myTypeConverters[i])
                    }
                }
                var typeConverters = new Array(dependentTypes.length);
                var unregisteredTypes = [];
                var registered = 0;
                dependentTypes.forEach((dt, i) => {
                    if (registeredTypes.hasOwnProperty(dt)) {
                        typeConverters[i] = registeredTypes[dt]
                    } else {
                        unregisteredTypes.push(dt);
                        if (!awaitingDependencies.hasOwnProperty(dt)) {
                            awaitingDependencies[dt] = []
                        }
                        awaitingDependencies[dt].push(() => {
                            typeConverters[i] = registeredTypes[dt];
                            ++registered;
                            if (registered === unregisteredTypes.length) {
                                onComplete(typeConverters)
                            }
                        })
                    }
                });
                if (0 === unregisteredTypes.length) {
                    onComplete(typeConverters)
                }
            }

            function __embind_finalize_value_object(structType) {
                var reg = structRegistrations[structType];
                delete structRegistrations[structType];
                var rawConstructor = reg.rawConstructor;
                var rawDestructor = reg.rawDestructor;
                var fieldRecords = reg.fields;
                var fieldTypes = fieldRecords.map(field => field.getterReturnType).concat(fieldRecords.map(field => field.setterArgumentType));
                whenDependentTypesAreResolved([structType], fieldTypes, fieldTypes => {
                    var fields = {};
                    fieldRecords.forEach((field, i) => {
                        var fieldName = field.fieldName;
                        var getterReturnType = fieldTypes[i];
                        var getter = field.getter;
                        var getterContext = field.getterContext;
                        var setterArgumentType = fieldTypes[i + fieldRecords.length];
                        var setter = field.setter;
                        var setterContext = field.setterContext;
                        fields[fieldName] = {
                            read: ptr => {
                                return getterReturnType["fromWireType"](getter(getterContext, ptr))
                            },
                            write: (ptr, o) => {
                                var destructors = [];
                                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, o));
                                runDestructors(destructors)
                            }
                        }
                    });
                    return [{
                        name: reg.name,
                        "fromWireType": function(ptr) {
                            var rv = {};
                            for (var i in fields) {
                                rv[i] = fields[i].read(ptr)
                            }
                            rawDestructor(ptr);
                            return rv
                        },
                        "toWireType": function(destructors, o) {
                            for (var fieldName in fields) {
                                if (!(fieldName in o)) {
                                    throw new TypeError('Missing field:  "' + fieldName + '"')
                                }
                            }
                            var ptr = rawConstructor();
                            for (fieldName in fields) {
                                fields[fieldName].write(ptr, o[fieldName])
                            }
                            if (destructors !== null) {
                                destructors.push(rawDestructor, ptr)
                            }
                            return ptr
                        },
                        "argPackAdvance": 8,
                        "readValueFromPointer": simpleReadValueFromPointer,
                        destructorFunction: rawDestructor
                    }]
                })
            }

            function __embind_register_bigint(primitiveType, name, size, minRange, maxRange) {}

            function getShiftFromSize(size) {
                switch (size) {
                    case 1:
                        return 0;
                    case 2:
                        return 1;
                    case 4:
                        return 2;
                    case 8:
                        return 3;
                    default:
                        throw new TypeError("Unknown type size: " + size)
                }
            }

            function embind_init_charCodes() {
                var codes = new Array(256);
                for (var i = 0; i < 256; ++i) {
                    codes[i] = String.fromCharCode(i)
                }
                embind_charCodes = codes
            }
            var embind_charCodes = undefined;

            function readLatin1String(ptr) {
                var ret = "";
                var c = ptr;
                while (HEAPU8[c]) {
                    ret += embind_charCodes[HEAPU8[c++]]
                }
                return ret
            }
            var BindingError = undefined;

            function throwBindingError(message) {
                throw new BindingError(message)
            }

            function registerType(rawType, registeredInstance, options = {}) {
                if (!("argPackAdvance" in registeredInstance)) {
                    throw new TypeError("registerType registeredInstance requires argPackAdvance")
                }
                var name = registeredInstance.name;
                if (!rawType) {
                    throwBindingError('type "' + name + '" must have a positive integer typeid pointer')
                }
                if (registeredTypes.hasOwnProperty(rawType)) {
                    if (options.ignoreDuplicateRegistrations) {
                        return
                    } else {
                        throwBindingError("Cannot register type '" + name + "' twice")
                    }
                }
                registeredTypes[rawType] = registeredInstance;
                delete typeDependencies[rawType];
                if (awaitingDependencies.hasOwnProperty(rawType)) {
                    var callbacks = awaitingDependencies[rawType];
                    delete awaitingDependencies[rawType];
                    callbacks.forEach(cb => cb())
                }
            }

            function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": function(wt) {
                        return !!wt
                    },
                    "toWireType": function(destructors, o) {
                        return o ? trueValue : falseValue
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": function(pointer) {
                        var heap;
                        if (size === 1) {
                            heap = HEAP8
                        } else if (size === 2) {
                            heap = HEAP16
                        } else if (size === 4) {
                            heap = HEAP32
                        } else {
                            throw new TypeError("Unknown boolean type size: " + name)
                        }
                        return this["fromWireType"](heap[pointer >> shift])
                    },
                    destructorFunction: null
                })
            }

            function ClassHandle_isAliasOf(other) {
                if (!(this instanceof ClassHandle)) {
                    return false
                }
                if (!(other instanceof ClassHandle)) {
                    return false
                }
                var leftClass = this.$$.ptrType.registeredClass;
                var left = this.$$.ptr;
                var rightClass = other.$$.ptrType.registeredClass;
                var right = other.$$.ptr;
                while (leftClass.baseClass) {
                    left = leftClass.upcast(left);
                    leftClass = leftClass.baseClass
                }
                while (rightClass.baseClass) {
                    right = rightClass.upcast(right);
                    rightClass = rightClass.baseClass
                }
                return leftClass === rightClass && left === right
            }

            function shallowCopyInternalPointer(o) {
                return {
                    count: o.count,
                    deleteScheduled: o.deleteScheduled,
                    preservePointerOnDelete: o.preservePointerOnDelete,
                    ptr: o.ptr,
                    ptrType: o.ptrType,
                    smartPtr: o.smartPtr,
                    smartPtrType: o.smartPtrType
                }
            }

            function throwInstanceAlreadyDeleted(obj) {
                function getInstanceTypeName(handle) {
                    return handle.$$.ptrType.registeredClass.name
                }
                throwBindingError(getInstanceTypeName(obj) + " instance already deleted")
            }
            var finalizationRegistry = false;

            function detachFinalizer(handle) {}

            function runDestructor($$) {
                if ($$.smartPtr) {
                    $$.smartPtrType.rawDestructor($$.smartPtr)
                } else {
                    $$.ptrType.registeredClass.rawDestructor($$.ptr)
                }
            }

            function releaseClassHandle($$) {
                $$.count.value -= 1;
                var toDelete = 0 === $$.count.value;
                if (toDelete) {
                    runDestructor($$)
                }
            }

            function downcastPointer(ptr, ptrClass, desiredClass) {
                if (ptrClass === desiredClass) {
                    return ptr
                }
                if (undefined === desiredClass.baseClass) {
                    return null
                }
                var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
                if (rv === null) {
                    return null
                }
                return desiredClass.downcast(rv)
            }
            var registeredPointers = {};

            function getInheritedInstanceCount() {
                return Object.keys(registeredInstances).length
            }

            function getLiveInheritedInstances() {
                var rv = [];
                for (var k in registeredInstances) {
                    if (registeredInstances.hasOwnProperty(k)) {
                        rv.push(registeredInstances[k])
                    }
                }
                return rv
            }
            var deletionQueue = [];

            function flushPendingDeletes() {
                while (deletionQueue.length) {
                    var obj = deletionQueue.pop();
                    obj.$$.deleteScheduled = false;
                    obj["delete"]()
                }
            }
            var delayFunction = undefined;

            function setDelayFunction(fn) {
                delayFunction = fn;
                if (deletionQueue.length && delayFunction) {
                    delayFunction(flushPendingDeletes)
                }
            }

            function init_embind() {
                Module["getInheritedInstanceCount"] = getInheritedInstanceCount;
                Module["getLiveInheritedInstances"] = getLiveInheritedInstances;
                Module["flushPendingDeletes"] = flushPendingDeletes;
                Module["setDelayFunction"] = setDelayFunction
            }
            var registeredInstances = {};

            function getBasestPointer(class_, ptr) {
                if (ptr === undefined) {
                    throwBindingError("ptr should not be undefined")
                }
                while (class_.baseClass) {
                    ptr = class_.upcast(ptr);
                    class_ = class_.baseClass
                }
                return ptr
            }

            function getInheritedInstance(class_, ptr) {
                ptr = getBasestPointer(class_, ptr);
                return registeredInstances[ptr]
            }

            function makeClassHandle(prototype, record) {
                if (!record.ptrType || !record.ptr) {
                    throwInternalError("makeClassHandle requires ptr and ptrType")
                }
                var hasSmartPtrType = !!record.smartPtrType;
                var hasSmartPtr = !!record.smartPtr;
                if (hasSmartPtrType !== hasSmartPtr) {
                    throwInternalError("Both smartPtrType and smartPtr must be specified")
                }
                record.count = {
                    value: 1
                };
                return attachFinalizer(Object.create(prototype, {
                    $$: {
                        value: record
                    }
                }))
            }

            function RegisteredPointer_fromWireType(ptr) {
                var rawPointer = this.getPointee(ptr);
                if (!rawPointer) {
                    this.destructor(ptr);
                    return null
                }
                var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
                if (undefined !== registeredInstance) {
                    if (0 === registeredInstance.$$.count.value) {
                        registeredInstance.$$.ptr = rawPointer;
                        registeredInstance.$$.smartPtr = ptr;
                        return registeredInstance["clone"]()
                    } else {
                        var rv = registeredInstance["clone"]();
                        this.destructor(ptr);
                        return rv
                    }
                }

                function makeDefaultHandle() {
                    if (this.isSmartPointer) {
                        return makeClassHandle(this.registeredClass.instancePrototype, {
                            ptrType: this.pointeeType,
                            ptr: rawPointer,
                            smartPtrType: this,
                            smartPtr: ptr
                        })
                    } else {
                        return makeClassHandle(this.registeredClass.instancePrototype, {
                            ptrType: this,
                            ptr: ptr
                        })
                    }
                }
                var actualType = this.registeredClass.getActualType(rawPointer);
                var registeredPointerRecord = registeredPointers[actualType];
                if (!registeredPointerRecord) {
                    return makeDefaultHandle.call(this)
                }
                var toType;
                if (this.isConst) {
                    toType = registeredPointerRecord.constPointerType
                } else {
                    toType = registeredPointerRecord.pointerType
                }
                var dp = downcastPointer(rawPointer, this.registeredClass, toType.registeredClass);
                if (dp === null) {
                    return makeDefaultHandle.call(this)
                }
                if (this.isSmartPointer) {
                    return makeClassHandle(toType.registeredClass.instancePrototype, {
                        ptrType: toType,
                        ptr: dp,
                        smartPtrType: this,
                        smartPtr: ptr
                    })
                } else {
                    return makeClassHandle(toType.registeredClass.instancePrototype, {
                        ptrType: toType,
                        ptr: dp
                    })
                }
            }

            function attachFinalizer(handle) {
                if ("undefined" === typeof FinalizationRegistry) {
                    attachFinalizer = handle => handle;
                    return handle
                }
                finalizationRegistry = new FinalizationRegistry(info => {
                    releaseClassHandle(info.$$)
                });
                attachFinalizer = handle => {
                    var $$ = handle.$$;
                    var hasSmartPtr = !!$$.smartPtr;
                    if (hasSmartPtr) {
                        var info = {
                            $$: $$
                        };
                        finalizationRegistry.register(handle, info, handle)
                    }
                    return handle
                };
                detachFinalizer = handle => finalizationRegistry.unregister(handle);
                return attachFinalizer(handle)
            }

            function ClassHandle_clone() {
                if (!this.$$.ptr) {
                    throwInstanceAlreadyDeleted(this)
                }
                if (this.$$.preservePointerOnDelete) {
                    this.$$.count.value += 1;
                    return this
                } else {
                    var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
                        $$: {
                            value: shallowCopyInternalPointer(this.$$)
                        }
                    }));
                    clone.$$.count.value += 1;
                    clone.$$.deleteScheduled = false;
                    return clone
                }
            }

            function ClassHandle_delete() {
                if (!this.$$.ptr) {
                    throwInstanceAlreadyDeleted(this)
                }
                if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
                    throwBindingError("Object already scheduled for deletion")
                }
                detachFinalizer(this);
                releaseClassHandle(this.$$);
                if (!this.$$.preservePointerOnDelete) {
                    this.$$.smartPtr = undefined;
                    this.$$.ptr = undefined
                }
            }

            function ClassHandle_isDeleted() {
                return !this.$$.ptr
            }

            function ClassHandle_deleteLater() {
                if (!this.$$.ptr) {
                    throwInstanceAlreadyDeleted(this)
                }
                if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
                    throwBindingError("Object already scheduled for deletion")
                }
                deletionQueue.push(this);
                if (deletionQueue.length === 1 && delayFunction) {
                    delayFunction(flushPendingDeletes)
                }
                this.$$.deleteScheduled = true;
                return this
            }

            function init_ClassHandle() {
                ClassHandle.prototype["isAliasOf"] = ClassHandle_isAliasOf;
                ClassHandle.prototype["clone"] = ClassHandle_clone;
                ClassHandle.prototype["delete"] = ClassHandle_delete;
                ClassHandle.prototype["isDeleted"] = ClassHandle_isDeleted;
                ClassHandle.prototype["deleteLater"] = ClassHandle_deleteLater
            }

            function ClassHandle() {}

            function ensureOverloadTable(proto, methodName, humanName) {
                if (undefined === proto[methodName].overloadTable) {
                    var prevFunc = proto[methodName];
                    proto[methodName] = function() {
                        if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                            throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!")
                        }
                        return proto[methodName].overloadTable[arguments.length].apply(this, arguments)
                    };
                    proto[methodName].overloadTable = [];
                    proto[methodName].overloadTable[prevFunc.argCount] = prevFunc
                }
            }

            function exposePublicSymbol(name, value, numArguments) {
                if (Module.hasOwnProperty(name)) {
                    if (undefined === numArguments || undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments]) {
                        throwBindingError("Cannot register public name '" + name + "' twice")
                    }
                    ensureOverloadTable(Module, name, name);
                    if (Module.hasOwnProperty(numArguments)) {
                        throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!")
                    }
                    Module[name].overloadTable[numArguments] = value
                } else {
                    Module[name] = value;
                    if (undefined !== numArguments) {
                        Module[name].numArguments = numArguments
                    }
                }
            }

            function RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast) {
                this.name = name;
                this.constructor = constructor;
                this.instancePrototype = instancePrototype;
                this.rawDestructor = rawDestructor;
                this.baseClass = baseClass;
                this.getActualType = getActualType;
                this.upcast = upcast;
                this.downcast = downcast;
                this.pureVirtualFunctions = []
            }

            function upcastPointer(ptr, ptrClass, desiredClass) {
                while (ptrClass !== desiredClass) {
                    if (!ptrClass.upcast) {
                        throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name)
                    }
                    ptr = ptrClass.upcast(ptr);
                    ptrClass = ptrClass.baseClass
                }
                return ptr
            }

            function constNoSmartPtrRawPointerToWireType(destructors, handle) {
                if (handle === null) {
                    if (this.isReference) {
                        throwBindingError("null is not a valid " + this.name)
                    }
                    return 0
                }
                if (!handle.$$) {
                    throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name)
                }
                if (!handle.$$.ptr) {
                    throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
                }
                var handleClass = handle.$$.ptrType.registeredClass;
                var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
                return ptr
            }

            function genericPointerToWireType(destructors, handle) {
                var ptr;
                if (handle === null) {
                    if (this.isReference) {
                        throwBindingError("null is not a valid " + this.name)
                    }
                    if (this.isSmartPointer) {
                        ptr = this.rawConstructor();
                        if (destructors !== null) {
                            destructors.push(this.rawDestructor, ptr)
                        }
                        return ptr
                    } else {
                        return 0
                    }
                }
                if (!handle.$$) {
                    throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name)
                }
                if (!handle.$$.ptr) {
                    throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
                }
                if (!this.isConst && handle.$$.ptrType.isConst) {
                    throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
                }
                var handleClass = handle.$$.ptrType.registeredClass;
                ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
                if (this.isSmartPointer) {
                    if (undefined === handle.$$.smartPtr) {
                        throwBindingError("Passing raw pointer to smart pointer is illegal")
                    }
                    switch (this.sharingPolicy) {
                        case 0:
                            if (handle.$$.smartPtrType === this) {
                                ptr = handle.$$.smartPtr
                            } else {
                                throwBindingError("Cannot convert argument of type " + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + " to parameter type " + this.name)
                            }
                            break;
                        case 1:
                            ptr = handle.$$.smartPtr;
                            break;
                        case 2:
                            if (handle.$$.smartPtrType === this) {
                                ptr = handle.$$.smartPtr
                            } else {
                                var clonedHandle = handle["clone"]();
                                ptr = this.rawShare(ptr, Emval.toHandle(function() {
                                    clonedHandle["delete"]()
                                }));
                                if (destructors !== null) {
                                    destructors.push(this.rawDestructor, ptr)
                                }
                            }
                            break;
                        default:
                            throwBindingError("Unsupporting sharing policy")
                    }
                }
                return ptr
            }

            function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
                if (handle === null) {
                    if (this.isReference) {
                        throwBindingError("null is not a valid " + this.name)
                    }
                    return 0
                }
                if (!handle.$$) {
                    throwBindingError('Cannot pass "' + embindRepr(handle) + '" as a ' + this.name)
                }
                if (!handle.$$.ptr) {
                    throwBindingError("Cannot pass deleted object as a pointer of type " + this.name)
                }
                if (handle.$$.ptrType.isConst) {
                    throwBindingError("Cannot convert argument of type " + handle.$$.ptrType.name + " to parameter type " + this.name)
                }
                var handleClass = handle.$$.ptrType.registeredClass;
                var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
                return ptr
            }

            function RegisteredPointer_getPointee(ptr) {
                if (this.rawGetPointee) {
                    ptr = this.rawGetPointee(ptr)
                }
                return ptr
            }

            function RegisteredPointer_destructor(ptr) {
                if (this.rawDestructor) {
                    this.rawDestructor(ptr)
                }
            }

            function RegisteredPointer_deleteObject(handle) {
                if (handle !== null) {
                    handle["delete"]()
                }
            }

            function init_RegisteredPointer() {
                RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
                RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
                RegisteredPointer.prototype["argPackAdvance"] = 8;
                RegisteredPointer.prototype["readValueFromPointer"] = simpleReadValueFromPointer;
                RegisteredPointer.prototype["deleteObject"] = RegisteredPointer_deleteObject;
                RegisteredPointer.prototype["fromWireType"] = RegisteredPointer_fromWireType
            }

            function RegisteredPointer(name, registeredClass, isReference, isConst, isSmartPointer, pointeeType, sharingPolicy, rawGetPointee, rawConstructor, rawShare, rawDestructor) {
                this.name = name;
                this.registeredClass = registeredClass;
                this.isReference = isReference;
                this.isConst = isConst;
                this.isSmartPointer = isSmartPointer;
                this.pointeeType = pointeeType;
                this.sharingPolicy = sharingPolicy;
                this.rawGetPointee = rawGetPointee;
                this.rawConstructor = rawConstructor;
                this.rawShare = rawShare;
                this.rawDestructor = rawDestructor;
                if (!isSmartPointer && registeredClass.baseClass === undefined) {
                    if (isConst) {
                        this["toWireType"] = constNoSmartPtrRawPointerToWireType;
                        this.destructorFunction = null
                    } else {
                        this["toWireType"] = nonConstNoSmartPtrRawPointerToWireType;
                        this.destructorFunction = null
                    }
                } else {
                    this["toWireType"] = genericPointerToWireType
                }
            }

            function replacePublicSymbol(name, value, numArguments) {
                if (!Module.hasOwnProperty(name)) {
                    throwInternalError("Replacing nonexistant public symbol")
                }
                if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
                    Module[name].overloadTable[numArguments] = value
                } else {
                    Module[name] = value;
                    Module[name].argCount = numArguments
                }
            }

            function dynCallLegacy(sig, ptr, args) {
                var f = Module["dynCall_" + sig];
                return args && args.length ? f.apply(null, [ptr].concat(args)) : f.call(null, ptr)
            }
            var wasmTableMirror = [];

            function getWasmTableEntry(funcPtr) {
                var func = wasmTableMirror[funcPtr];
                if (!func) {
                    if (funcPtr >= wasmTableMirror.length) wasmTableMirror.length = funcPtr + 1;
                    wasmTableMirror[funcPtr] = func = wasmTable.get(funcPtr)
                }
                return func
            }

            function dynCall(sig, ptr, args) {
                if (sig.includes("j")) {
                    return dynCallLegacy(sig, ptr, args)
                }
                var rtn = getWasmTableEntry(ptr).apply(null, args);
                return rtn
            }

            function getDynCaller(sig, ptr) {
                var argCache = [];
                return function() {
                    argCache.length = 0;
                    Object.assign(argCache, arguments);
                    return dynCall(sig, ptr, argCache)
                }
            }

            function embind__requireFunction(signature, rawFunction) {
                signature = readLatin1String(signature);

                function makeDynCaller() {
                    if (signature.includes("j")) {
                        return getDynCaller(signature, rawFunction)
                    }
                    return getWasmTableEntry(rawFunction)
                }
                var fp = makeDynCaller();
                if (typeof fp != "function") {
                    throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction)
                }
                return fp
            }
            var UnboundTypeError = undefined;

            function getTypeName(type) {
                var ptr = ___getTypeName(type);
                var rv = readLatin1String(ptr);
                _free(ptr);
                return rv
            }

            function throwUnboundTypeError(message, types) {
                var unboundTypes = [];
                var seen = {};

                function visit(type) {
                    if (seen[type]) {
                        return
                    }
                    if (registeredTypes[type]) {
                        return
                    }
                    if (typeDependencies[type]) {
                        typeDependencies[type].forEach(visit);
                        return
                    }
                    unboundTypes.push(type);
                    seen[type] = true
                }
                types.forEach(visit);
                throw new UnboundTypeError(message + ": " + unboundTypes.map(getTypeName).join([", "]))
            }

            function __embind_register_class(rawType, rawPointerType, rawConstPointerType, baseClassRawType, getActualTypeSignature, getActualType, upcastSignature, upcast, downcastSignature, downcast, name, destructorSignature, rawDestructor) {
                name = readLatin1String(name);
                getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
                if (upcast) {
                    upcast = embind__requireFunction(upcastSignature, upcast)
                }
                if (downcast) {
                    downcast = embind__requireFunction(downcastSignature, downcast)
                }
                rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
                var legalFunctionName = makeLegalFunctionName(name);
                exposePublicSymbol(legalFunctionName, function() {
                    throwUnboundTypeError("Cannot construct " + name + " due to unbound types", [baseClassRawType])
                });
                whenDependentTypesAreResolved([rawType, rawPointerType, rawConstPointerType], baseClassRawType ? [baseClassRawType] : [], function(base) {
                    base = base[0];
                    var baseClass;
                    var basePrototype;
                    if (baseClassRawType) {
                        baseClass = base.registeredClass;
                        basePrototype = baseClass.instancePrototype
                    } else {
                        basePrototype = ClassHandle.prototype
                    }
                    var constructor = createNamedFunction(legalFunctionName, function() {
                        if (Object.getPrototypeOf(this) !== instancePrototype) {
                            throw new BindingError("Use 'new' to construct " + name)
                        }
                        if (undefined === registeredClass.constructor_body) {
                            throw new BindingError(name + " has no accessible constructor")
                        }
                        var body = registeredClass.constructor_body[arguments.length];
                        if (undefined === body) {
                            throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!")
                        }
                        return body.apply(this, arguments)
                    });
                    var instancePrototype = Object.create(basePrototype, {
                        constructor: {
                            value: constructor
                        }
                    });
                    constructor.prototype = instancePrototype;
                    var registeredClass = new RegisteredClass(name, constructor, instancePrototype, rawDestructor, baseClass, getActualType, upcast, downcast);
                    var referenceConverter = new RegisteredPointer(name, registeredClass, true, false, false);
                    var pointerConverter = new RegisteredPointer(name + "*", registeredClass, false, false, false);
                    var constPointerConverter = new RegisteredPointer(name + " const*", registeredClass, false, true, false);
                    registeredPointers[rawType] = {
                        pointerType: pointerConverter,
                        constPointerType: constPointerConverter
                    };
                    replacePublicSymbol(legalFunctionName, constructor);
                    return [referenceConverter, pointerConverter, constPointerConverter]
                })
            }

            function new_(constructor, argumentList) {
                if (!(constructor instanceof Function)) {
                    throw new TypeError("new_ called with constructor type " + typeof constructor + " which is not a function")
                }
                var dummy = createNamedFunction(constructor.name || "unknownFunctionName", function() {});
                dummy.prototype = constructor.prototype;
                var obj = new dummy;
                var r = constructor.apply(obj, argumentList);
                return r instanceof Object ? r : obj
            }

            function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
                var argCount = argTypes.length;
                if (argCount < 2) {
                    throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!")
                }
                var isClassMethodFunc = argTypes[1] !== null && classType !== null;
                var needsDestructorStack = false;
                for (var i = 1; i < argTypes.length; ++i) {
                    if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) {
                        needsDestructorStack = true;
                        break
                    }
                }
                var returns = argTypes[0].name !== "void";
                var argsList = "";
                var argsListWired = "";
                for (var i = 0; i < argCount - 2; ++i) {
                    argsList += (i !== 0 ? ", " : "") + "arg" + i;
                    argsListWired += (i !== 0 ? ", " : "") + "arg" + i + "Wired"
                }
                var invokerFnBody = "return function " + makeLegalFunctionName(humanName) + "(" + argsList + ") {\n" + "if (arguments.length !== " + (argCount - 2) + ") {\n" + "throwBindingError('function " + humanName + " called with ' + arguments.length + ' arguments, expected " + (argCount - 2) + " args!');\n" + "}\n";
                if (needsDestructorStack) {
                    invokerFnBody += "var destructors = [];\n"
                }
                var dtorStack = needsDestructorStack ? "destructors" : "null";
                var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
                var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
                if (isClassMethodFunc) {
                    invokerFnBody += "var thisWired = classParam.toWireType(" + dtorStack + ", this);\n"
                }
                for (var i = 0; i < argCount - 2; ++i) {
                    invokerFnBody += "var arg" + i + "Wired = argType" + i + ".toWireType(" + dtorStack + ", arg" + i + "); // " + argTypes[i + 2].name + "\n";
                    args1.push("argType" + i);
                    args2.push(argTypes[i + 2])
                }
                if (isClassMethodFunc) {
                    argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired
                }
                invokerFnBody += (returns ? "var rv = " : "") + "invoker(fn" + (argsListWired.length > 0 ? ", " : "") + argsListWired + ");\n";
                if (needsDestructorStack) {
                    invokerFnBody += "runDestructors(destructors);\n"
                } else {
                    for (var i = isClassMethodFunc ? 1 : 2; i < argTypes.length; ++i) {
                        var paramName = i === 1 ? "thisWired" : "arg" + (i - 2) + "Wired";
                        if (argTypes[i].destructorFunction !== null) {
                            invokerFnBody += paramName + "_dtor(" + paramName + "); // " + argTypes[i].name + "\n";
                            args1.push(paramName + "_dtor");
                            args2.push(argTypes[i].destructorFunction)
                        }
                    }
                }
                if (returns) {
                    invokerFnBody += "var ret = retType.fromWireType(rv);\n" + "return ret;\n"
                } else {}
                invokerFnBody += "}\n";
                args1.push(invokerFnBody);
                var invokerFunction = new_(Function, args1).apply(null, args2);
                return invokerFunction
            }

            function heap32VectorToArray(count, firstElement) {
                var array = [];
                for (var i = 0; i < count; i++) {
                    array.push(HEAPU32[firstElement + i * 4 >> 2])
                }
                return array
            }

            function __embind_register_class_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, fn) {
                var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
                methodName = readLatin1String(methodName);
                rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
                whenDependentTypesAreResolved([], [rawClassType], function(classType) {
                    classType = classType[0];
                    var humanName = classType.name + "." + methodName;

                    function unboundTypesHandler() {
                        throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
                    }
                    if (methodName.startsWith("@@")) {
                        methodName = Symbol[methodName.substring(2)]
                    }
                    var proto = classType.registeredClass.constructor;
                    if (undefined === proto[methodName]) {
                        unboundTypesHandler.argCount = argCount - 1;
                        proto[methodName] = unboundTypesHandler
                    } else {
                        ensureOverloadTable(proto, methodName, humanName);
                        proto[methodName].overloadTable[argCount - 1] = unboundTypesHandler
                    }
                    whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
                        var invokerArgsArray = [argTypes[0], null].concat(argTypes.slice(1));
                        var func = craftInvokerFunction(humanName, invokerArgsArray, null, rawInvoker, fn);
                        if (undefined === proto[methodName].overloadTable) {
                            func.argCount = argCount - 1;
                            proto[methodName] = func
                        } else {
                            proto[methodName].overloadTable[argCount - 1] = func
                        }
                        return []
                    });
                    return []
                })
            }

            function __embind_register_class_constructor(rawClassType, argCount, rawArgTypesAddr, invokerSignature, invoker, rawConstructor) {
                assert(argCount > 0);
                var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
                invoker = embind__requireFunction(invokerSignature, invoker);
                whenDependentTypesAreResolved([], [rawClassType], function(classType) {
                    classType = classType[0];
                    var humanName = "constructor " + classType.name;
                    if (undefined === classType.registeredClass.constructor_body) {
                        classType.registeredClass.constructor_body = []
                    }
                    if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
                        throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount - 1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!")
                    }
                    classType.registeredClass.constructor_body[argCount - 1] = () => {
                        throwUnboundTypeError("Cannot construct " + classType.name + " due to unbound types", rawArgTypes)
                    };
                    whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
                        argTypes.splice(1, 0, null);
                        classType.registeredClass.constructor_body[argCount - 1] = craftInvokerFunction(humanName, argTypes, null, invoker, rawConstructor);
                        return []
                    });
                    return []
                })
            }

            function __embind_register_class_function(rawClassType, methodName, argCount, rawArgTypesAddr, invokerSignature, rawInvoker, context, isPureVirtual) {
                var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
                methodName = readLatin1String(methodName);
                rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
                whenDependentTypesAreResolved([], [rawClassType], function(classType) {
                    classType = classType[0];
                    var humanName = classType.name + "." + methodName;
                    if (methodName.startsWith("@@")) {
                        methodName = Symbol[methodName.substring(2)]
                    }
                    if (isPureVirtual) {
                        classType.registeredClass.pureVirtualFunctions.push(methodName)
                    }

                    function unboundTypesHandler() {
                        throwUnboundTypeError("Cannot call " + humanName + " due to unbound types", rawArgTypes)
                    }
                    var proto = classType.registeredClass.instancePrototype;
                    var method = proto[methodName];
                    if (undefined === method || undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2) {
                        unboundTypesHandler.argCount = argCount - 2;
                        unboundTypesHandler.className = classType.name;
                        proto[methodName] = unboundTypesHandler
                    } else {
                        ensureOverloadTable(proto, methodName, humanName);
                        proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler
                    }
                    whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
                        var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
                        if (undefined === proto[methodName].overloadTable) {
                            memberFunction.argCount = argCount - 2;
                            proto[methodName] = memberFunction
                        } else {
                            proto[methodName].overloadTable[argCount - 2] = memberFunction
                        }
                        return []
                    });
                    return []
                })
            }

            function validateThis(this_, classType, humanName) {
                if (!(this_ instanceof Object)) {
                    throwBindingError(humanName + ' with invalid "this": ' + this_)
                }
                if (!(this_ instanceof classType.registeredClass.constructor)) {
                    throwBindingError(humanName + ' incompatible with "this" of type ' + this_.constructor.name)
                }
                if (!this_.$$.ptr) {
                    throwBindingError("cannot call emscripten binding method " + humanName + " on deleted object")
                }
                return upcastPointer(this_.$$.ptr, this_.$$.ptrType.registeredClass, classType.registeredClass)
            }

            function __embind_register_class_property(classType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
                fieldName = readLatin1String(fieldName);
                getter = embind__requireFunction(getterSignature, getter);
                whenDependentTypesAreResolved([], [classType], function(classType) {
                    classType = classType[0];
                    var humanName = classType.name + "." + fieldName;
                    var desc = {
                        get: function() {
                            throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType])
                        },
                        enumerable: true,
                        configurable: true
                    };
                    if (setter) {
                        desc.set = () => {
                            throwUnboundTypeError("Cannot access " + humanName + " due to unbound types", [getterReturnType, setterArgumentType])
                        }
                    } else {
                        desc.set = v => {
                            throwBindingError(humanName + " is a read-only property")
                        }
                    }
                    Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
                    whenDependentTypesAreResolved([], setter ? [getterReturnType, setterArgumentType] : [getterReturnType], function(types) {
                        var getterReturnType = types[0];
                        var desc = {
                            get: function() {
                                var ptr = validateThis(this, classType, humanName + " getter");
                                return getterReturnType["fromWireType"](getter(getterContext, ptr))
                            },
                            enumerable: true
                        };
                        if (setter) {
                            setter = embind__requireFunction(setterSignature, setter);
                            var setterArgumentType = types[1];
                            desc.set = function(v) {
                                var ptr = validateThis(this, classType, humanName + " setter");
                                var destructors = [];
                                setter(setterContext, ptr, setterArgumentType["toWireType"](destructors, v));
                                runDestructors(destructors)
                            }
                        }
                        Object.defineProperty(classType.registeredClass.instancePrototype, fieldName, desc);
                        return []
                    });
                    return []
                })
            }
            var emval_free_list = [];
            var emval_handle_array = [{}, {
                value: undefined
            }, {
                value: null
            }, {
                value: true
            }, {
                value: false
            }];

            function __emval_decref(handle) {
                if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
                    emval_handle_array[handle] = undefined;
                    emval_free_list.push(handle)
                }
            }

            function count_emval_handles() {
                var count = 0;
                for (var i = 5; i < emval_handle_array.length; ++i) {
                    if (emval_handle_array[i] !== undefined) {
                        ++count
                    }
                }
                return count
            }

            function get_first_emval() {
                for (var i = 5; i < emval_handle_array.length; ++i) {
                    if (emval_handle_array[i] !== undefined) {
                        return emval_handle_array[i]
                    }
                }
                return null
            }

            function init_emval() {
                Module["count_emval_handles"] = count_emval_handles;
                Module["get_first_emval"] = get_first_emval
            }
            var Emval = {
                toValue: handle => {
                    if (!handle) {
                        throwBindingError("Cannot use deleted val. handle = " + handle)
                    }
                    return emval_handle_array[handle].value
                },
                toHandle: value => {
                    switch (value) {
                        case undefined:
                            return 1;
                        case null:
                            return 2;
                        case true:
                            return 3;
                        case false:
                            return 4;
                        default: {
                            var handle = emval_free_list.length ? emval_free_list.pop() : emval_handle_array.length;
                            emval_handle_array[handle] = {
                                refcount: 1,
                                value: value
                            };
                            return handle
                        }
                    }
                }
            };

            function __embind_register_emval(rawType, name) {
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": function(handle) {
                        var rv = Emval.toValue(handle);
                        __emval_decref(handle);
                        return rv
                    },
                    "toWireType": function(destructors, value) {
                        return Emval.toHandle(value)
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: null
                })
            }

            function embindRepr(v) {
                if (v === null) {
                    return "null"
                }
                var t = typeof v;
                if (t === "object" || t === "array" || t === "function") {
                    return v.toString()
                } else {
                    return "" + v
                }
            }

            function floatReadValueFromPointer(name, shift) {
                switch (shift) {
                    case 2:
                        return function(pointer) {
                            return this["fromWireType"](HEAPF32[pointer >> 2])
                        };
                    case 3:
                        return function(pointer) {
                            return this["fromWireType"](HEAPF64[pointer >> 3])
                        };
                    default:
                        throw new TypeError("Unknown float type: " + name)
                }
            }

            function __embind_register_float(rawType, name, size) {
                var shift = getShiftFromSize(size);
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": function(value) {
                        return value
                    },
                    "toWireType": function(destructors, value) {
                        return value
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": floatReadValueFromPointer(name, shift),
                    destructorFunction: null
                })
            }

            function integerReadValueFromPointer(name, shift, signed) {
                switch (shift) {
                    case 0:
                        return signed ? function readS8FromPointer(pointer) {
                            return HEAP8[pointer]
                        } : function readU8FromPointer(pointer) {
                            return HEAPU8[pointer]
                        };
                    case 1:
                        return signed ? function readS16FromPointer(pointer) {
                            return HEAP16[pointer >> 1]
                        } : function readU16FromPointer(pointer) {
                            return HEAPU16[pointer >> 1]
                        };
                    case 2:
                        return signed ? function readS32FromPointer(pointer) {
                            return HEAP32[pointer >> 2]
                        } : function readU32FromPointer(pointer) {
                            return HEAPU32[pointer >> 2]
                        };
                    default:
                        throw new TypeError("Unknown integer type: " + name)
                }
            }

            function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
                name = readLatin1String(name);
                if (maxRange === -1) {
                    maxRange = 4294967295
                }
                var shift = getShiftFromSize(size);
                var fromWireType = value => value;
                if (minRange === 0) {
                    var bitshift = 32 - 8 * size;
                    fromWireType = value => value << bitshift >>> bitshift
                }
                var isUnsignedType = name.includes("unsigned");
                var checkAssertions = (value, toTypeName) => {};
                var toWireType;
                if (isUnsignedType) {
                    toWireType = function(destructors, value) {
                        checkAssertions(value, this.name);
                        return value >>> 0
                    }
                } else {
                    toWireType = function(destructors, value) {
                        checkAssertions(value, this.name);
                        return value
                    }
                }
                registerType(primitiveType, {
                    name: name,
                    "fromWireType": fromWireType,
                    "toWireType": toWireType,
                    "argPackAdvance": 8,
                    "readValueFromPointer": integerReadValueFromPointer(name, shift, minRange !== 0),
                    destructorFunction: null
                })
            }

            function __embind_register_memory_view(rawType, dataTypeIndex, name) {
                var typeMapping = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array];
                var TA = typeMapping[dataTypeIndex];

                function decodeMemoryView(handle) {
                    handle = handle >> 2;
                    var heap = HEAPU32;
                    var size = heap[handle];
                    var data = heap[handle + 1];
                    return new TA(buffer, data, size)
                }
                name = readLatin1String(name);
                registerType(rawType, {
                    name: name,
                    "fromWireType": decodeMemoryView,
                    "argPackAdvance": 8,
                    "readValueFromPointer": decodeMemoryView
                }, {
                    ignoreDuplicateRegistrations: true
                })
            }

            function __embind_register_std_string(rawType, name) {
                name = readLatin1String(name);
                var stdStringIsUTF8 = name === "std::string";
                registerType(rawType, {
                    name: name,
                    "fromWireType": function(value) {
                        var length = HEAPU32[value >> 2];
                        var payload = value + 4;
                        var str;
                        if (stdStringIsUTF8) {
                            var decodeStartPtr = payload;
                            for (var i = 0; i <= length; ++i) {
                                var currentBytePtr = payload + i;
                                if (i == length || HEAPU8[currentBytePtr] == 0) {
                                    var maxRead = currentBytePtr - decodeStartPtr;
                                    var stringSegment = UTF8ToString(decodeStartPtr, maxRead);
                                    if (str === undefined) {
                                        str = stringSegment
                                    } else {
                                        str += String.fromCharCode(0);
                                        str += stringSegment
                                    }
                                    decodeStartPtr = currentBytePtr + 1
                                }
                            }
                        } else {
                            var a = new Array(length);
                            for (var i = 0; i < length; ++i) {
                                a[i] = String.fromCharCode(HEAPU8[payload + i])
                            }
                            str = a.join("")
                        }
                        _free(value);
                        return str
                    },
                    "toWireType": function(destructors, value) {
                        if (value instanceof ArrayBuffer) {
                            value = new Uint8Array(value)
                        }
                        var length;
                        var valueIsOfTypeString = typeof value == "string";
                        if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                            throwBindingError("Cannot pass non-string to std::string")
                        }
                        if (stdStringIsUTF8 && valueIsOfTypeString) {
                            length = lengthBytesUTF8(value)
                        } else {
                            length = value.length
                        }
                        var base = _malloc(4 + length + 1);
                        var ptr = base + 4;
                        HEAPU32[base >> 2] = length;
                        if (stdStringIsUTF8 && valueIsOfTypeString) {
                            stringToUTF8(value, ptr, length + 1)
                        } else {
                            if (valueIsOfTypeString) {
                                for (var i = 0; i < length; ++i) {
                                    var charCode = value.charCodeAt(i);
                                    if (charCode > 255) {
                                        _free(ptr);
                                        throwBindingError("String has UTF-16 code units that do not fit in 8 bits")
                                    }
                                    HEAPU8[ptr + i] = charCode
                                }
                            } else {
                                for (var i = 0; i < length; ++i) {
                                    HEAPU8[ptr + i] = value[i]
                                }
                            }
                        }
                        if (destructors !== null) {
                            destructors.push(_free, base)
                        }
                        return base
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: function(ptr) {
                        _free(ptr)
                    }
                })
            }
            var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;

            function UTF16ToString(ptr, maxBytesToRead) {
                var endPtr = ptr;
                var idx = endPtr >> 1;
                var maxIdx = idx + maxBytesToRead / 2;
                while (!(idx >= maxIdx) && HEAPU16[idx]) ++idx;
                endPtr = idx << 1;
                if (endPtr - ptr > 32 && UTF16Decoder) {
                    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr))
                } else {
                    var str = "";
                    for (var i = 0; !(i >= maxBytesToRead / 2); ++i) {
                        var codeUnit = HEAP16[ptr + i * 2 >> 1];
                        if (codeUnit == 0) break;
                        str += String.fromCharCode(codeUnit)
                    }
                    return str
                }
            }

            function stringToUTF16(str, outPtr, maxBytesToWrite) {
                if (maxBytesToWrite === undefined) {
                    maxBytesToWrite = 2147483647
                }
                if (maxBytesToWrite < 2) return 0;
                maxBytesToWrite -= 2;
                var startPtr = outPtr;
                var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
                for (var i = 0; i < numCharsToWrite; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    HEAP16[outPtr >> 1] = codeUnit;
                    outPtr += 2
                }
                HEAP16[outPtr >> 1] = 0;
                return outPtr - startPtr
            }

            function lengthBytesUTF16(str) {
                return str.length * 2
            }

            function UTF32ToString(ptr, maxBytesToRead) {
                var i = 0;
                var str = "";
                while (!(i >= maxBytesToRead / 4)) {
                    var utf32 = HEAP32[ptr + i * 4 >> 2];
                    if (utf32 == 0) break;
                    ++i;
                    if (utf32 >= 65536) {
                        var ch = utf32 - 65536;
                        str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023)
                    } else {
                        str += String.fromCharCode(utf32)
                    }
                }
                return str
            }

            function stringToUTF32(str, outPtr, maxBytesToWrite) {
                if (maxBytesToWrite === undefined) {
                    maxBytesToWrite = 2147483647
                }
                if (maxBytesToWrite < 4) return 0;
                var startPtr = outPtr;
                var endPtr = startPtr + maxBytesToWrite - 4;
                for (var i = 0; i < str.length; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    if (codeUnit >= 55296 && codeUnit <= 57343) {
                        var trailSurrogate = str.charCodeAt(++i);
                        codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023
                    }
                    HEAP32[outPtr >> 2] = codeUnit;
                    outPtr += 4;
                    if (outPtr + 4 > endPtr) break
                }
                HEAP32[outPtr >> 2] = 0;
                return outPtr - startPtr
            }

            function lengthBytesUTF32(str) {
                var len = 0;
                for (var i = 0; i < str.length; ++i) {
                    var codeUnit = str.charCodeAt(i);
                    if (codeUnit >= 55296 && codeUnit <= 57343) ++i;
                    len += 4
                }
                return len
            }

            function __embind_register_std_wstring(rawType, charSize, name) {
                name = readLatin1String(name);
                var decodeString, encodeString, getHeap, lengthBytesUTF, shift;
                if (charSize === 2) {
                    decodeString = UTF16ToString;
                    encodeString = stringToUTF16;
                    lengthBytesUTF = lengthBytesUTF16;
                    getHeap = () => HEAPU16;
                    shift = 1
                } else if (charSize === 4) {
                    decodeString = UTF32ToString;
                    encodeString = stringToUTF32;
                    lengthBytesUTF = lengthBytesUTF32;
                    getHeap = () => HEAPU32;
                    shift = 2
                }
                registerType(rawType, {
                    name: name,
                    "fromWireType": function(value) {
                        var length = HEAPU32[value >> 2];
                        var HEAP = getHeap();
                        var str;
                        var decodeStartPtr = value + 4;
                        for (var i = 0; i <= length; ++i) {
                            var currentBytePtr = value + 4 + i * charSize;
                            if (i == length || HEAP[currentBytePtr >> shift] == 0) {
                                var maxReadBytes = currentBytePtr - decodeStartPtr;
                                var stringSegment = decodeString(decodeStartPtr, maxReadBytes);
                                if (str === undefined) {
                                    str = stringSegment
                                } else {
                                    str += String.fromCharCode(0);
                                    str += stringSegment
                                }
                                decodeStartPtr = currentBytePtr + charSize
                            }
                        }
                        _free(value);
                        return str
                    },
                    "toWireType": function(destructors, value) {
                        if (!(typeof value == "string")) {
                            throwBindingError("Cannot pass non-string to C++ string type " + name)
                        }
                        var length = lengthBytesUTF(value);
                        var ptr = _malloc(4 + length + charSize);
                        HEAPU32[ptr >> 2] = length >> shift;
                        encodeString(value, ptr + 4, length + charSize);
                        if (destructors !== null) {
                            destructors.push(_free, ptr)
                        }
                        return ptr
                    },
                    "argPackAdvance": 8,
                    "readValueFromPointer": simpleReadValueFromPointer,
                    destructorFunction: function(ptr) {
                        _free(ptr)
                    }
                })
            }

            function __embind_register_value_object(rawType, name, constructorSignature, rawConstructor, destructorSignature, rawDestructor) {
                structRegistrations[rawType] = {
                    name: readLatin1String(name),
                    rawConstructor: embind__requireFunction(constructorSignature, rawConstructor),
                    rawDestructor: embind__requireFunction(destructorSignature, rawDestructor),
                    fields: []
                }
            }

            function __embind_register_value_object_field(structType, fieldName, getterReturnType, getterSignature, getter, getterContext, setterArgumentType, setterSignature, setter, setterContext) {
                structRegistrations[structType].fields.push({
                    fieldName: readLatin1String(fieldName),
                    getterReturnType: getterReturnType,
                    getter: embind__requireFunction(getterSignature, getter),
                    getterContext: getterContext,
                    setterArgumentType: setterArgumentType,
                    setter: embind__requireFunction(setterSignature, setter),
                    setterContext: setterContext
                })
            }

            function __embind_register_void(rawType, name) {
                name = readLatin1String(name);
                registerType(rawType, {
                    isVoid: true,
                    name: name,
                    "argPackAdvance": 0,
                    "fromWireType": function() {
                        return undefined
                    },
                    "toWireType": function(destructors, o) {
                        return undefined
                    }
                })
            }

            function requireRegisteredType(rawType, humanName) {
                var impl = registeredTypes[rawType];
                if (undefined === impl) {
                    throwBindingError(humanName + " has unknown type " + getTypeName(rawType))
                }
                return impl
            }

            function __emval_as(handle, returnType, destructorsRef) {
                handle = Emval.toValue(handle);
                returnType = requireRegisteredType(returnType, "emval::as");
                var destructors = [];
                var rd = Emval.toHandle(destructors);
                HEAPU32[destructorsRef >> 2] = rd;
                return returnType["toWireType"](destructors, handle)
            }
            var emval_symbols = {};

            function getStringOrSymbol(address) {
                var symbol = emval_symbols[address];
                if (symbol === undefined) {
                    return readLatin1String(address)
                }
                return symbol
            }
            var emval_methodCallers = [];

            function __emval_call_void_method(caller, handle, methodName, args) {
                caller = emval_methodCallers[caller];
                handle = Emval.toValue(handle);
                methodName = getStringOrSymbol(methodName);
                caller(handle, methodName, null, args)
            }

            function emval_addMethodCaller(caller) {
                var id = emval_methodCallers.length;
                emval_methodCallers.push(caller);
                return id
            }

            function emval_lookupTypes(argCount, argTypes) {
                var a = new Array(argCount);
                for (var i = 0; i < argCount; ++i) {
                    a[i] = requireRegisteredType(HEAPU32[argTypes + i * POINTER_SIZE >> 2], "parameter " + i)
                }
                return a
            }
            var emval_registeredMethods = [];

            function __emval_get_method_caller(argCount, argTypes) {
                var types = emval_lookupTypes(argCount, argTypes);
                var retType = types[0];
                var signatureName = retType.name + "_$" + types.slice(1).map(function(t) {
                    return t.name
                }).join("_") + "$";
                var returnId = emval_registeredMethods[signatureName];
                if (returnId !== undefined) {
                    return returnId
                }
                var params = ["retType"];
                var args = [retType];
                var argsList = "";
                for (var i = 0; i < argCount - 1; ++i) {
                    argsList += (i !== 0 ? ", " : "") + "arg" + i;
                    params.push("argType" + i);
                    args.push(types[1 + i])
                }
                var functionName = makeLegalFunctionName("methodCaller_" + signatureName);
                var functionBody = "return function " + functionName + "(handle, name, destructors, args) {\n";
                var offset = 0;
                for (var i = 0; i < argCount - 1; ++i) {
                    functionBody += "    var arg" + i + " = argType" + i + ".readValueFromPointer(args" + (offset ? "+" + offset : "") + ");\n";
                    offset += types[i + 1]["argPackAdvance"]
                }
                functionBody += "    var rv = handle[name](" + argsList + ");\n";
                for (var i = 0; i < argCount - 1; ++i) {
                    if (types[i + 1]["deleteObject"]) {
                        functionBody += "    argType" + i + ".deleteObject(arg" + i + ");\n"
                    }
                }
                if (!retType.isVoid) {
                    functionBody += "    return retType.toWireType(destructors, rv);\n"
                }
                functionBody += "};\n";
                params.push(functionBody);
                var invokerFunction = new_(Function, params).apply(null, args);
                returnId = emval_addMethodCaller(invokerFunction);
                emval_registeredMethods[signatureName] = returnId;
                return returnId
            }

            function __emval_get_property(handle, key) {
                handle = Emval.toValue(handle);
                key = Emval.toValue(key);
                return Emval.toHandle(handle[key])
            }

            function __emval_incref(handle) {
                if (handle > 4) {
                    emval_handle_array[handle].refcount += 1
                }
            }

            function __emval_new_array() {
                return Emval.toHandle([])
            }

            function __emval_new_cstring(v) {
                return Emval.toHandle(getStringOrSymbol(v))
            }

            function __emval_run_destructors(handle) {
                var destructors = Emval.toValue(handle);
                runDestructors(destructors);
                __emval_decref(handle)
            }

            function __emval_set_property(handle, key, value) {
                handle = Emval.toValue(handle);
                key = Emval.toValue(key);
                value = Emval.toValue(value);
                handle[key] = value
            }

            function __emval_take_value(type, arg) {
                type = requireRegisteredType(type, "_emval_take_value");
                var v = type["readValueFromPointer"](arg);
                return Emval.toHandle(v)
            }

            function _abort() {
                abort("")
            }

            function _emscripten_memcpy_big(dest, src, num) {
                HEAPU8.copyWithin(dest, src, src + num)
            }

            function getHeapMax() {
                return 2147483648
            }

            function emscripten_realloc_buffer(size) {
                try {
                    wasmMemory.grow(size - buffer.byteLength + 65535 >>> 16);
                    updateGlobalBufferAndViews(wasmMemory.buffer);
                    return 1
                } catch (e) {}
            }

            function _emscripten_resize_heap(requestedSize) {
                var oldSize = HEAPU8.length;
                requestedSize = requestedSize >>> 0;
                var maxHeapSize = getHeapMax();
                if (requestedSize > maxHeapSize) {
                    return false
                }
                let alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
                for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
                    var overGrownHeapSize = oldSize * (1 + .2 / cutDown);
                    overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
                    var newSize = Math.min(maxHeapSize, alignUp(Math.max(requestedSize, overGrownHeapSize), 65536));
                    var replacement = emscripten_realloc_buffer(newSize);
                    if (replacement) {
                        return true
                    }
                }
                return false
            }
            var WebGPU = {
                initManagers: function() {
                    if (WebGPU.mgrDevice) return;

                    function Manager() {
                        this.objects = {};
                        this.nextId = 1;
                        this.create = function(object, wrapper) {
                            wrapper = wrapper || {};
                            var id = this.nextId++;
                            wrapper.refcount = 1;
                            wrapper.object = object;
                            this.objects[id] = wrapper;
                            return id
                        };
                        this.get = function(id) {
                            if (!id) return undefined;
                            var o = this.objects[id];
                            return o.object
                        };
                        this.reference = function(id) {
                            var o = this.objects[id];
                            o.refcount++
                        };
                        this.release = function(id) {
                            var o = this.objects[id];
                            o.refcount--;
                            if (o.refcount <= 0) {
                                delete this.objects[id]
                            }
                        }
                    }
                    WebGPU.mgrSurface = WebGPU.mgrSurface || new Manager;
                    WebGPU.mgrSwapChain = WebGPU.mgrSwapChain || new Manager;
                    WebGPU.mgrAdapter = WebGPU.mgrAdapter || new Manager;
                    WebGPU.mgrDevice = WebGPU.mgrDevice || new Manager;
                    WebGPU.mgrQueue = WebGPU.mgrQueue || new Manager;
                    WebGPU.mgrCommandBuffer = WebGPU.mgrCommandBuffer || new Manager;
                    WebGPU.mgrCommandEncoder = WebGPU.mgrCommandEncoder || new Manager;
                    WebGPU.mgrRenderPassEncoder = WebGPU.mgrRenderPassEncoder || new Manager;
                    WebGPU.mgrComputePassEncoder = WebGPU.mgrComputePassEncoder || new Manager;
                    WebGPU.mgrBindGroup = WebGPU.mgrBindGroup || new Manager;
                    WebGPU.mgrBuffer = WebGPU.mgrBuffer || new Manager;
                    WebGPU.mgrSampler = WebGPU.mgrSampler || new Manager;
                    WebGPU.mgrTexture = WebGPU.mgrTexture || new Manager;
                    WebGPU.mgrTextureView = WebGPU.mgrTextureView || new Manager;
                    WebGPU.mgrQuerySet = WebGPU.mgrQuerySet || new Manager;
                    WebGPU.mgrBindGroupLayout = WebGPU.mgrBindGroupLayout || new Manager;
                    WebGPU.mgrPipelineLayout = WebGPU.mgrPipelineLayout || new Manager;
                    WebGPU.mgrRenderPipeline = WebGPU.mgrRenderPipeline || new Manager;
                    WebGPU.mgrComputePipeline = WebGPU.mgrComputePipeline || new Manager;
                    WebGPU.mgrShaderModule = WebGPU.mgrShaderModule || new Manager;
                    WebGPU.mgrRenderBundleEncoder = WebGPU.mgrRenderBundleEncoder || new Manager;
                    WebGPU.mgrRenderBundle = WebGPU.mgrRenderBundle || new Manager
                },
                makeColor: function(ptr) {
                    return {
                        "r": HEAPF64[ptr >> 3],
                        "g": HEAPF64[ptr + 8 >> 3],
                        "b": HEAPF64[ptr + 16 >> 3],
                        "a": HEAPF64[ptr + 24 >> 3]
                    }
                },
                makeExtent3D: function(ptr) {
                    return {
                        "width": HEAPU32[ptr >> 2],
                        "height": HEAPU32[ptr + 4 >> 2],
                        "depthOrArrayLayers": HEAPU32[ptr + 8 >> 2]
                    }
                },
                makeOrigin3D: function(ptr) {
                    return {
                        "x": HEAPU32[ptr >> 2],
                        "y": HEAPU32[ptr + 4 >> 2],
                        "z": HEAPU32[ptr + 8 >> 2]
                    }
                },
                makeImageCopyTexture: function(ptr) {
                    return {
                        "texture": WebGPU.mgrTexture.get(HEAPU32[ptr + 4 >> 2]),
                        "mipLevel": HEAPU32[ptr + 8 >> 2],
                        "origin": WebGPU.makeOrigin3D(ptr + 12),
                        "aspect": WebGPU.TextureAspect[HEAPU32[ptr + 24 >> 2]]
                    }
                },
                makeTextureDataLayout: function(ptr) {
                    var bytesPerRow = HEAPU32[ptr + 16 >> 2];
                    var rowsPerImage = HEAPU32[ptr + 20 >> 2];
                    return {
                        "offset": HEAPU32[ptr + 4 + 8 >> 2] * 4294967296 + HEAPU32[ptr + 8 >> 2],
                        "bytesPerRow": bytesPerRow === 4294967295 ? undefined : bytesPerRow,
                        "rowsPerImage": rowsPerImage === 4294967295 ? undefined : rowsPerImage
                    }
                },
                makeImageCopyBuffer: function(ptr) {
                    var layoutPtr = ptr + 8;
                    var bufferCopyView = WebGPU.makeTextureDataLayout(layoutPtr);
                    bufferCopyView["buffer"] = WebGPU.mgrBuffer.get(HEAPU32[ptr + 32 >> 2]);
                    return bufferCopyView
                },
                makePipelineConstants: function(constantCount, constantsPtr) {
                    if (!constantCount) return;
                    var constants = {};
                    for (var i = 0; i < constantCount; ++i) {
                        var entryPtr = constantsPtr + 16 * i;
                        var key = UTF8ToString(HEAPU32[entryPtr + 4 >> 2]);
                        constants[key] = HEAPF64[entryPtr + 8 >> 3]
                    }
                    return constants
                },
                makeProgrammableStageDescriptor: function(ptr) {
                    if (!ptr) return undefined;
                    return {
                        "module": WebGPU.mgrShaderModule.get(HEAPU32[ptr + 4 >> 2]),
                        "entryPoint": UTF8ToString(HEAPU32[ptr + 8 >> 2]),
                        "constants": WebGPU.makePipelineConstants(HEAPU32[ptr + 12 >> 2], HEAPU32[ptr + 16 >> 2])
                    }
                },
                DeviceLostReason: {
                    undefined: 0,
                    destroyed: 1
                },
                PreferredFormat: {
                    rgba8unorm: 18,
                    bgra8unorm: 23
                },
                AddressMode: ["repeat", "mirror-repeat", "clamp-to-edge"],
                BlendFactor: ["zero", "one", "src", "one-minus-src", "src-alpha", "one-minus-src-alpha", "dst", "one-minus-dst", "dst-alpha", "one-minus-dst-alpha", "src-alpha-saturated", "constant", "one-minus-constant"],
                BlendOperation: ["add", "subtract", "reverse-subtract", "min", "max"],
                BufferBindingType: [, "uniform", "storage", "read-only-storage"],
                CompareFunction: [, "never", "less", "less-equal", "greater", "greater-equal", "equal", "not-equal", "always"],
                CompilationInfoRequestStatus: ["success", "error", "device-lost", "unknown"],
                ComputePassTimestampLocation: ["beginning", "end"],
                CullMode: ["none", "front", "back"],
                ErrorFilter: ["validation", "out-of-memory"],
                FeatureName: {
                    0: undefined,
                    1: "depth-clip-control",
                    2: "depth24unorm-stencil8",
                    3: "depth32float-stencil8",
                    4: "timestamp-query",
                    5: "pipeline-statistics-query",
                    6: "texture-compression-bc",
                    7: "texture-compression-etc2",
                    8: "texture-compression-astc",
                    9: "indirect-first-instance",
                    1e3: "depth-clamping"
                },
                FilterMode: ["nearest", "linear"],
                FrontFace: ["ccw", "cw"],
                IndexFormat: [, "uint16", "uint32"],
                LoadOp: [, "clear", "load"],
                PipelineStatisticName: ["vertex-shader-invocations", "clipper-invocations", "clipper-primitives-out", "fragment-shader-invocations", "compute-shader-invocations"],
                PowerPreference: [, "low-power", "high-performance"],
                PredefinedColorSpace: [, "srgb"],
                PrimitiveTopology: ["point-list", "line-list", "line-strip", "triangle-list", "triangle-strip"],
                QueryType: ["occlusion", "pipeline-statistics", "timestamp"],
                RenderPassTimestampLocation: ["beginning", "end"],
                SamplerBindingType: [, "filtering", "non-filtering", "comparison"],
                StencilOperation: ["keep", "zero", "replace", "invert", "increment-clamp", "decrement-clamp", "increment-wrap", "decrement-wrap"],
                StorageTextureAccess: [, "write-only"],
                StoreOp: [, "store", "discard"],
                TextureAspect: ["all", "stencil-only", "depth-only"],
                TextureComponentType: ["float", "sint", "uint", "depth-comparison"],
                TextureDimension: ["1d", "2d", "3d"],
                TextureFormat: [, "r8unorm", "r8snorm", "r8uint", "r8sint", "r16uint", "r16sint", "r16float", "rg8unorm", "rg8snorm", "rg8uint", "rg8sint", "r32float", "r32uint", "r32sint", "rg16uint", "rg16sint", "rg16float", "rgba8unorm", "rgba8unorm-srgb", "rgba8snorm", "rgba8uint", "rgba8sint", "bgra8unorm", "bgra8unorm-srgb", "rgb10a2unorm", "rg11b10ufloat", "rgb9e5ufloat", "rg32float", "rg32uint", "rg32sint", "rgba16uint", "rgba16sint", "rgba16float", "rgba32float", "rgba32uint", "rgba32sint", "stencil8", "depth16unorm", "depth24plus", "depth24plus-stencil8", "depth24unorm-stencil8", "depth32float", "depth32float-stencil8", "bc1-rgba-unorm", "bc1-rgba-unorm-srgb", "bc2-rgba-unorm", "bc2-rgba-unorm-srgb", "bc3-rgba-unorm", "bc3-rgba-unorm-srgb", "bc4-r-unorm", "bc4-r-snorm", "bc5-rg-unorm", "bc5-rg-snorm", "bc6h-rgb-ufloat", "bc6h-rgb-float", "bc7-rgba-unorm", "bc7-rgba-unorm-srgb", "etc2-rgb8unorm", "etc2-rgb8unorm-srgb", "etc2-rgb8a1unorm", "etc2-rgb8a1unorm-srgb", "etc2-rgba8unorm", "etc2-rgba8unorm-srgb", "eac-r11unorm", "eac-r11snorm", "eac-rg11unorm", "eac-rg11snorm", "astc-4x4-unorm", "astc-4x4-unorm-srgb", "astc-5x4-unorm", "astc-5x4-unorm-srgb", "astc-5x5-unorm", "astc-5x5-unorm-srgb", "astc-6x5-unorm", "astc-6x5-unorm-srgb", "astc-6x6-unorm", "astc-6x6-unorm-srgb", "astc-8x5-unorm", "astc-8x5-unorm-srgb", "astc-8x6-unorm", "astc-8x6-unorm-srgb", "astc-8x8-unorm", "astc-8x8-unorm-srgb", "astc-10x5-unorm", "astc-10x5-unorm-srgb", "astc-10x6-unorm", "astc-10x6-unorm-srgb", "astc-10x8-unorm", "astc-10x8-unorm-srgb", "astc-10x10-unorm", "astc-10x10-unorm-srgb", "astc-12x10-unorm", "astc-12x10-unorm-srgb", "astc-12x12-unorm", "astc-12x12-unorm-srgb"],
                TextureSampleType: [, "float", "unfilterable-float", "depth", "sint", "uint"],
                TextureViewDimension: [, "1d", "2d", "2d-array", "cube", "cube-array", "3d"],
                VertexFormat: [, "uint8x2", "uint8x4", "sint8x2", "sint8x4", "unorm8x2", "unorm8x4", "snorm8x2", "snorm8x4", "uint16x2", "uint16x4", "sint16x2", "sint16x4", "unorm16x2", "unorm16x4", "snorm16x2", "snorm16x4", "float16x2", "float16x4", "float32", "float32x2", "float32x3", "float32x4", "uint32", "uint32x2", "uint32x3", "uint32x4", "sint32", "sint32x2", "sint32x3", "sint32x4"],
                VertexStepMode: ["vertex", "instance"],
                FeatureNameString2Enum: {
                    undefined: "0",
                    "depth-clip-control": "1",
                    "depth24unorm-stencil8": "2",
                    "depth32float-stencil8": "3",
                    "timestamp-query": "4",
                    "pipeline-statistics-query": "5",
                    "texture-compression-bc": "6",
                    "texture-compression-etc2": "7",
                    "texture-compression-astc": "8",
                    "indirect-first-instance": "9",
                    "depth-clamping": "1000"
                }
            };

            function _emscripten_webgpu_get_device() {
                var device = Module["preinitializedWebGPUDevice"];
                var deviceWrapper = {
                    queueId: WebGPU.mgrQueue.create(device["queue"])
                };
                return WebGPU.mgrDevice.create(device, deviceWrapper)
            }
            var ENV = {};

            function getExecutableName() {
                return thisProgram || "./this.program"
            }

            function getEnvStrings() {
                if (!getEnvStrings.strings) {
                    var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
                    var env = {
                        "USER": "web_user",
                        "LOGNAME": "web_user",
                        "PATH": "/",
                        "PWD": "/",
                        "HOME": "/home/web_user",
                        "LANG": lang,
                        "_": getExecutableName()
                    };
                    for (var x in ENV) {
                        if (ENV[x] === undefined) delete env[x];
                        else env[x] = ENV[x]
                    }
                    var strings = [];
                    for (var x in env) {
                        strings.push(x + "=" + env[x])
                    }
                    getEnvStrings.strings = strings
                }
                return getEnvStrings.strings
            }

            function writeAsciiToMemory(str, buffer, dontAddNull) {
                for (var i = 0; i < str.length; ++i) {
                    HEAP8[buffer++ >> 0] = str.charCodeAt(i)
                }
                if (!dontAddNull) HEAP8[buffer >> 0] = 0
            }
            var SYSCALLS = {
                varargs: undefined,
                get: function() {
                    SYSCALLS.varargs += 4;
                    var ret = HEAP32[SYSCALLS.varargs - 4 >> 2];
                    return ret
                },
                getStr: function(ptr) {
                    var ret = UTF8ToString(ptr);
                    return ret
                }
            };

            function _environ_get(__environ, environ_buf) {
                var bufSize = 0;
                getEnvStrings().forEach(function(string, i) {
                    var ptr = environ_buf + bufSize;
                    HEAPU32[__environ + i * 4 >> 2] = ptr;
                    writeAsciiToMemory(string, ptr);
                    bufSize += string.length + 1
                });
                return 0
            }

            function _environ_sizes_get(penviron_count, penviron_buf_size) {
                var strings = getEnvStrings();
                HEAPU32[penviron_count >> 2] = strings.length;
                var bufSize = 0;
                strings.forEach(function(string) {
                    bufSize += string.length + 1
                });
                HEAPU32[penviron_buf_size >> 2] = bufSize;
                return 0
            }
            var printCharBuffers = [null, [],
                []
            ];

            function printChar(stream, curr) {
                var buffer = printCharBuffers[stream];
                if (curr === 0 || curr === 10) {
                    (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
                    buffer.length = 0
                } else {
                    buffer.push(curr)
                }
            }

            function _fd_write(fd, iov, iovcnt, pnum) {
                var num = 0;
                for (var i = 0; i < iovcnt; i++) {
                    var ptr = HEAPU32[iov >> 2];
                    var len = HEAPU32[iov + 4 >> 2];
                    iov += 8;
                    for (var j = 0; j < len; j++) {
                        printChar(fd, HEAPU8[ptr + j])
                    }
                    num += len
                }
                HEAPU32[pnum >> 2] = num;
                return 0
            }

            function _setTempRet0(val) {
                setTempRet0(val)
            }

            function _wgpuAdapterGetProperties(adapterId, properties) {
                HEAP32[properties + 4 >> 2] = 0;
                HEAP32[properties + 8 >> 2] = 0;
                HEAP32[properties + 12 >> 2] = 0;
                HEAP32[properties + 16 >> 2] = 0;
                HEAP32[properties + 20 >> 2] = 3;
                HEAP32[properties + 24 >> 2] = 1
            }

            function _wgpuAdapterHasFeature(adapterId, featureEnumValue) {
                var adapter = WebGPU.mgrAdapter.get(adapterId);
                return adapter.features.has(WebGPU.FeatureName[featureEnumValue])
            }

            function _wgpuAdapterRelease(id) {
                WebGPU.mgrAdapter.release(id)
            }

            function _wgpuBindGroupRelease(id) {
                WebGPU.mgrBindGroup.release(id)
            }

            function _wgpuBufferDestroy(bufferId) {
                WebGPU.mgrBuffer.get(bufferId)["destroy"]()
            }

            function _wgpuBufferGetMappedRange(bufferId, offset, size) {
                var bufferWrapper = WebGPU.mgrBuffer.objects[bufferId];
                if (size === 0) warnOnce("getMappedRange size=0 no longer means WGPU_WHOLE_MAP_SIZE");
                size = size >>> 0;
                if (size === 4294967295) size = undefined;
                if (bufferWrapper.mapMode !== 2) {
                    return 0
                }
                var mapped;
                try {
                    mapped = bufferWrapper.object["getMappedRange"](offset, size)
                } catch (ex) {
                    return 0
                }
                var data = _malloc(mapped.byteLength);
                HEAPU8.fill(0, data, mapped.byteLength);
                bufferWrapper.onUnmap.push(function() {
                    new Uint8Array(mapped).set(HEAPU8.subarray(data, data + mapped.byteLength));
                    _free(data)
                });
                return data
            }

            function _wgpuBufferRelease(id) {
                WebGPU.mgrBuffer.release(id)
            }

            function _wgpuBufferUnmap(bufferId) {
                var bufferWrapper = WebGPU.mgrBuffer.objects[bufferId];
                if (!bufferWrapper.onUnmap) {
                    return
                }
                for (var i = 0; i < bufferWrapper.onUnmap.length; ++i) {
                    bufferWrapper.onUnmap[i]()
                }
                bufferWrapper.onUnmap = undefined;
                bufferWrapper.object["unmap"]()
            }

            function _wgpuCommandBufferRelease(id) {
                WebGPU.mgrCommandBuffer.release(id)
            }

            function _wgpuCommandEncoderBeginComputePass(encoderId, descriptor) {
                var desc;

                function makeComputePassTimestampWrite(twPtr) {
                    return {
                        "querySet": WebGPU.mgrQuerySet.get(HEAPU32[twPtr >> 2]),
                        "queryIndex": HEAPU32[twPtr + 4 >> 2],
                        "location": WebGPU.ComputePassTimestampLocation[HEAPU32[twPtr + 8 >> 2]]
                    }
                }

                function makeComputePassTimestampWrites(count, twPtr) {
                    var timestampWrites = [];
                    for (var i = 0; i < count; ++i) {
                        timestampWrites.push(makeComputePassTimestampWrite(twPtr + 12 * i))
                    }
                    return timestampWrites
                }
                if (descriptor) {
                    desc = {};
                    var labelPtr = HEAPU32[descriptor + 4 >> 2];
                    if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                    var timestampWriteCount = HEAPU32[descriptor + 8 >> 2];
                    if (timestampWriteCount) {
                        desc["timestampWrites"] = makeComputePassTimestampWrites(timestampWriteCount, HEAPU32[descriptor + 12 >> 2])
                    }
                }
                var commandEncoder = WebGPU.mgrCommandEncoder.get(encoderId);
                return WebGPU.mgrComputePassEncoder.create(commandEncoder["beginComputePass"](desc))
            }

            function _wgpuCommandEncoderBeginRenderPass(encoderId, descriptor) {
                function makeColorAttachment(caPtr) {
                    var viewPtr = HEAPU32[caPtr >> 2];
                    if (viewPtr === 0) {
                        return undefined
                    }
                    var loadOpInt = HEAPU32[caPtr + 8 >> 2];
                    var storeOpInt = HEAPU32[caPtr + 12 >> 2];
                    var clearValue = WebGPU.makeColor(caPtr + 16);
                    return {
                        "view": WebGPU.mgrTextureView.get(viewPtr),
                        "resolveTarget": WebGPU.mgrTextureView.get(HEAPU32[caPtr + 4 >> 2]),
                        "clearValue": clearValue,
                        "loadOp": WebGPU.LoadOp[loadOpInt],
                        "storeOp": WebGPU.StoreOp[storeOpInt]
                    }
                }

                function makeColorAttachments(count, caPtr) {
                    var attachments = [];
                    for (var i = 0; i < count; ++i) {
                        attachments.push(makeColorAttachment(caPtr + 48 * i))
                    }
                    return attachments
                }

                function makeDepthStencilAttachment(dsaPtr) {
                    if (dsaPtr === 0) return undefined;
                    return {
                        "view": WebGPU.mgrTextureView.get(HEAPU32[dsaPtr >> 2]),
                        "depthClearValue": HEAPF32[dsaPtr + 12 >> 2],
                        "depthLoadOp": WebGPU.LoadOp[HEAPU32[dsaPtr + 4 >> 2]],
                        "depthStoreOp": WebGPU.StoreOp[HEAPU32[dsaPtr + 8 >> 2]],
                        "depthReadOnly": HEAP8[dsaPtr + 16 >> 0] !== 0,
                        "stencilClearValue": HEAPU32[dsaPtr + 28 >> 2],
                        "stencilLoadOp": WebGPU.LoadOp[HEAPU32[dsaPtr + 20 >> 2]],
                        "stencilStoreOp": WebGPU.StoreOp[HEAPU32[dsaPtr + 24 >> 2]],
                        "stencilReadOnly": HEAP8[dsaPtr + 32 >> 0] !== 0
                    }
                }

                function makeRenderPassTimestampWrite(twPtr) {
                    return {
                        "querySet": WebGPU.mgrQuerySet.get(HEAPU32[twPtr >> 2]),
                        "queryIndex": HEAPU32[twPtr + 4 >> 2],
                        "location": WebGPU.RenderPassTimestampLocation[HEAPU32[twPtr + 8 >> 2]]
                    }
                }

                function makeRenderPassTimestampWrites(count, twPtr) {
                    var timestampWrites = [];
                    for (var i = 0; i < count; ++i) {
                        timestampWrites.push(makeRenderPassTimestampWrite(twPtr + 12 * i))
                    }
                    return timestampWrites
                }

                function makeRenderPassDescriptor(descriptor) {
                    var desc = {
                        "label": undefined,
                        "colorAttachments": makeColorAttachments(HEAPU32[descriptor + 8 >> 2], HEAPU32[descriptor + 12 >> 2]),
                        "depthStencilAttachment": makeDepthStencilAttachment(HEAPU32[descriptor + 16 >> 2]),
                        "occlusionQuerySet": WebGPU.mgrQuerySet.get(HEAPU32[descriptor + 20 >> 2])
                    };
                    var labelPtr = HEAPU32[descriptor + 4 >> 2];
                    if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                    var timestampWriteCount = HEAPU32[descriptor + 24 >> 2];
                    if (timestampWriteCount) {
                        desc["timestampWrites"] = makeRenderPassTimestampWrites(timestampWriteCount, HEAPU32[descriptor + 28 >> 2])
                    }
                    return desc
                }
                var desc = makeRenderPassDescriptor(descriptor);
                var commandEncoder = WebGPU.mgrCommandEncoder.get(encoderId);
                return WebGPU.mgrRenderPassEncoder.create(commandEncoder["beginRenderPass"](desc))
            }

            function _wgpuCommandEncoderCopyBufferToBuffer(encoderId, srcId, srcOffset_low, srcOffset_high, dstId, dstOffset_low, dstOffset_high, size_low, size_high) {
                var commandEncoder = WebGPU.mgrCommandEncoder.get(encoderId);
                var src = WebGPU.mgrBuffer.get(srcId);
                var dst = WebGPU.mgrBuffer.get(dstId);
                commandEncoder["copyBufferToBuffer"](src, srcOffset_high * 4294967296 + srcOffset_low, dst, dstOffset_high * 4294967296 + dstOffset_low, size_high * 4294967296 + size_low)
            }

            function _wgpuCommandEncoderCopyBufferToTexture(encoderId, srcPtr, dstPtr, copySizePtr) {
                var commandEncoder = WebGPU.mgrCommandEncoder.get(encoderId);
                var copySize = WebGPU.makeExtent3D(copySizePtr);
                commandEncoder["copyBufferToTexture"](WebGPU.makeImageCopyBuffer(srcPtr), WebGPU.makeImageCopyTexture(dstPtr), copySize)
            }

            function _wgpuCommandEncoderCopyTextureToTexture(encoderId, srcPtr, dstPtr, copySizePtr) {
                var commandEncoder = WebGPU.mgrCommandEncoder.get(encoderId);
                var copySize = WebGPU.makeExtent3D(copySizePtr);
                commandEncoder["copyTextureToTexture"](WebGPU.makeImageCopyTexture(srcPtr), WebGPU.makeImageCopyTexture(dstPtr), copySize)
            }

            function _wgpuCommandEncoderFinish(encoderId) {
                var commandEncoder = WebGPU.mgrCommandEncoder.get(encoderId);
                return WebGPU.mgrCommandBuffer.create(commandEncoder["finish"]())
            }

            function _wgpuCommandEncoderRelease(id) {
                WebGPU.mgrCommandEncoder.release(id)
            }

            function _wgpuComputePassEncoderDispatchWorkgroups(passId, x, y, z) {
                var pass = WebGPU.mgrComputePassEncoder.get(passId);
                if (pass["dispatchWorkgroups"]) {
                    pass["dispatchWorkgroups"](x, y, z)
                } else {
                    pass["dispatch"](x, y, z)
                }
            }

            function _wgpuComputePassEncoderDispatchWorkgroupsIndirect(passId, indirectBufferId, indirectOffset_low, indirectOffset_high) {
                var indirectBuffer = WebGPU.mgrBuffer.get(indirectBufferId);
                var indirectOffset = indirectOffset_high * 4294967296 + indirectOffset_low;
                var pass = WebGPU.mgrComputePassEncoder.get(passId);
                if (pass["dispatchWorkgroupsIndirect"]) {
                    pass["dispatchWorkgroupsIndirect"](indirectBuffer, indirectOffset)
                } else {
                    pass["dispatchIndirect"](indirectBuffer, indirectOffset)
                }
            }

            function _wgpuComputePassEncoderEnd(passId) {
                var pass = WebGPU.mgrComputePassEncoder.get(passId);
                pass["end"]()
            }

            function _wgpuComputePassEncoderRelease(id) {
                WebGPU.mgrComputePassEncoder.release(id)
            }

            function _wgpuComputePassEncoderSetBindGroup(passId, groupIndex, groupId, dynamicOffsetCount, dynamicOffsetsPtr) {
                var pass = WebGPU.mgrComputePassEncoder.get(passId);
                var group = WebGPU.mgrBindGroup.get(groupId);
                if (dynamicOffsetCount == 0) {
                    pass["setBindGroup"](groupIndex, group)
                } else {
                    var offsets = [];
                    for (var i = 0; i < dynamicOffsetCount; i++, dynamicOffsetsPtr += 4) {
                        offsets.push(HEAPU32[dynamicOffsetsPtr >> 2])
                    }
                    pass["setBindGroup"](groupIndex, group, offsets)
                }
            }

            function _wgpuComputePassEncoderSetPipeline(passId, pipelineId) {
                var pass = WebGPU.mgrComputePassEncoder.get(passId);
                var pipeline = WebGPU.mgrComputePipeline.get(pipelineId);
                pass["setPipeline"](pipeline)
            }

            function _wgpuComputePipelineRelease(id) {
                WebGPU.mgrComputePipeline.release(id)
            }

            function _wgpuDeviceCreateBindGroup(deviceId, descriptor) {
                function makeEntry(entryPtr) {
                    var bufferId = HEAPU32[entryPtr + 8 >> 2];
                    var samplerId = HEAPU32[entryPtr + 32 >> 2];
                    var textureViewId = HEAPU32[entryPtr + 36 >> 2];
                    var binding = HEAPU32[entryPtr + 4 >> 2];
                    if (bufferId) {
                        var size_low = HEAPU32[entryPtr + 24 >> 2];
                        var size_high = HEAPU32[entryPtr + 28 >> 2];
                        var size = size_high === -1 && size_low === -1 ? undefined : size_high * 4294967296 + size_low;
                        return {
                            "binding": binding,
                            "resource": {
                                "buffer": WebGPU.mgrBuffer.get(bufferId),
                                "offset": HEAPU32[entryPtr + 4 + 16 >> 2] * 4294967296 + HEAPU32[entryPtr + 16 >> 2],
                                "size": size
                            }
                        }
                    } else if (samplerId) {
                        return {
                            "binding": binding,
                            "resource": WebGPU.mgrSampler.get(samplerId)
                        }
                    } else {
                        return {
                            "binding": binding,
                            "resource": WebGPU.mgrTextureView.get(textureViewId)
                        }
                    }
                }

                function makeEntries(count, entriesPtrs) {
                    var entries = [];
                    for (var i = 0; i < count; ++i) {
                        entries.push(makeEntry(entriesPtrs + 40 * i))
                    }
                    return entries
                }
                var desc = {
                    "label": undefined,
                    "layout": WebGPU.mgrBindGroupLayout.get(HEAPU32[descriptor + 8 >> 2]),
                    "entries": makeEntries(HEAPU32[descriptor + 12 >> 2], HEAPU32[descriptor + 16 >> 2])
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrBindGroup.create(device["createBindGroup"](desc))
            }

            function _wgpuDeviceCreateBindGroupLayout(deviceId, descriptor) {
                function makeBufferEntry(entryPtr) {
                    var typeInt = HEAPU32[entryPtr + 4 >> 2];
                    if (!typeInt) return undefined;
                    return {
                        "type": WebGPU.BufferBindingType[typeInt],
                        "hasDynamicOffset": HEAP8[entryPtr + 8 >> 0] !== 0,
                        "minBindingSize": HEAPU32[entryPtr + 4 + 16 >> 2] * 4294967296 + HEAPU32[entryPtr + 16 >> 2]
                    }
                }

                function makeSamplerEntry(entryPtr) {
                    var typeInt = HEAPU32[entryPtr + 4 >> 2];
                    if (!typeInt) return undefined;
                    return {
                        "type": WebGPU.SamplerBindingType[typeInt]
                    }
                }

                function makeTextureEntry(entryPtr) {
                    var sampleTypeInt = HEAPU32[entryPtr + 4 >> 2];
                    if (!sampleTypeInt) return undefined;
                    return {
                        "sampleType": WebGPU.TextureSampleType[sampleTypeInt],
                        "viewDimension": WebGPU.TextureViewDimension[HEAPU32[entryPtr + 8 >> 2]],
                        "multisampled": HEAP8[entryPtr + 12 >> 0] !== 0
                    }
                }

                function makeStorageTextureEntry(entryPtr) {
                    var accessInt = HEAPU32[entryPtr + 4 >> 2];
                    if (!accessInt) return undefined;
                    return {
                        "access": WebGPU.StorageTextureAccess[accessInt],
                        "format": WebGPU.TextureFormat[HEAPU32[entryPtr + 8 >> 2]],
                        "viewDimension": WebGPU.TextureViewDimension[HEAPU32[entryPtr + 12 >> 2]]
                    }
                }

                function makeEntry(entryPtr) {
                    return {
                        "binding": HEAPU32[entryPtr + 4 >> 2],
                        "visibility": HEAPU32[entryPtr + 8 >> 2],
                        "buffer": makeBufferEntry(entryPtr + 16),
                        "sampler": makeSamplerEntry(entryPtr + 40),
                        "texture": makeTextureEntry(entryPtr + 48),
                        "storageTexture": makeStorageTextureEntry(entryPtr + 64)
                    }
                }

                function makeEntries(count, entriesPtrs) {
                    var entries = [];
                    for (var i = 0; i < count; ++i) {
                        entries.push(makeEntry(entriesPtrs + 80 * i))
                    }
                    return entries
                }
                var desc = {
                    "entries": makeEntries(HEAPU32[descriptor + 8 >> 2], HEAPU32[descriptor + 12 >> 2])
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrBindGroupLayout.create(device["createBindGroupLayout"](desc))
            }

            function _wgpuDeviceCreateBuffer(deviceId, descriptor) {
                var mappedAtCreation = HEAP8[descriptor + 24 >> 0] !== 0;
                var desc = {
                    "label": undefined,
                    "usage": HEAPU32[descriptor + 8 >> 2],
                    "size": HEAPU32[descriptor + 4 + 16 >> 2] * 4294967296 + HEAPU32[descriptor + 16 >> 2],
                    "mappedAtCreation": mappedAtCreation
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                var bufferWrapper = {};
                var id = WebGPU.mgrBuffer.create(device["createBuffer"](desc), bufferWrapper);
                if (mappedAtCreation) {
                    bufferWrapper.mapMode = 2;
                    bufferWrapper.onUnmap = []
                }
                return id
            }

            function _wgpuDeviceCreateCommandEncoder(deviceId, descriptor) {
                var desc;
                if (descriptor) {
                    desc = {
                        "label": undefined
                    };
                    var labelPtr = HEAPU32[descriptor + 4 >> 2];
                    if (labelPtr) desc["label"] = UTF8ToString(labelPtr)
                }
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrCommandEncoder.create(device["createCommandEncoder"](desc))
            }

            function _wgpuDeviceCreateComputePipeline(deviceId, descriptor) {
                var desc = {
                    "label": undefined,
                    "layout": WebGPU.mgrPipelineLayout.get(HEAPU32[descriptor + 8 >> 2]),
                    "compute": WebGPU.makeProgrammableStageDescriptor(descriptor + 12)
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrComputePipeline.create(device["createComputePipeline"](desc))
            }

            function _wgpuDeviceCreatePipelineLayout(deviceId, descriptor) {
                var bglCount = HEAPU32[descriptor + 8 >> 2];
                var bglPtr = HEAPU32[descriptor + 12 >> 2];
                var bgls = [];
                for (var i = 0; i < bglCount; ++i) {
                    bgls.push(WebGPU.mgrBindGroupLayout.get(HEAPU32[bglPtr + 4 * i >> 2]))
                }
                var desc = {
                    "label": undefined,
                    "bindGroupLayouts": bgls
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrPipelineLayout.create(device["createPipelineLayout"](desc))
            }

            function _wgpuDeviceCreateRenderPipeline(deviceId, descriptor) {
                function makePrimitiveState(rsPtr) {
                    if (!rsPtr) return undefined;
                    return {
                        "topology": WebGPU.PrimitiveTopology[HEAPU32[rsPtr + 4 >> 2]],
                        "stripIndexFormat": WebGPU.IndexFormat[HEAPU32[rsPtr + 8 >> 2]],
                        "frontFace": WebGPU.FrontFace[HEAPU32[rsPtr + 12 >> 2]],
                        "cullMode": WebGPU.CullMode[HEAPU32[rsPtr + 16 >> 2]]
                    }
                }

                function makeBlendComponent(bdPtr) {
                    if (!bdPtr) return undefined;
                    return {
                        "operation": WebGPU.BlendOperation[HEAPU32[bdPtr >> 2]],
                        "srcFactor": WebGPU.BlendFactor[HEAPU32[bdPtr + 4 >> 2]],
                        "dstFactor": WebGPU.BlendFactor[HEAPU32[bdPtr + 8 >> 2]]
                    }
                }

                function makeBlendState(bsPtr) {
                    if (!bsPtr) return undefined;
                    return {
                        "alpha": makeBlendComponent(bsPtr + 12),
                        "color": makeBlendComponent(bsPtr + 0)
                    }
                }

                function makeColorState(csPtr) {
                    var formatInt = HEAPU32[csPtr + 4 >> 2];
                    return formatInt === 0 ? undefined : {
                        "format": WebGPU.TextureFormat[formatInt],
                        "blend": makeBlendState(HEAPU32[csPtr + 8 >> 2]),
                        "writeMask": HEAPU32[csPtr + 12 >> 2]
                    }
                }

                function makeColorStates(count, csArrayPtr) {
                    var states = [];
                    for (var i = 0; i < count; ++i) {
                        states.push(makeColorState(csArrayPtr + 16 * i))
                    }
                    return states
                }

                function makeStencilStateFace(ssfPtr) {
                    return {
                        "compare": WebGPU.CompareFunction[HEAPU32[ssfPtr >> 2]],
                        "failOp": WebGPU.StencilOperation[HEAPU32[ssfPtr + 4 >> 2]],
                        "depthFailOp": WebGPU.StencilOperation[HEAPU32[ssfPtr + 8 >> 2]],
                        "passOp": WebGPU.StencilOperation[HEAPU32[ssfPtr + 12 >> 2]]
                    }
                }

                function makeDepthStencilState(dssPtr) {
                    if (!dssPtr) return undefined;
                    return {
                        "format": WebGPU.TextureFormat[HEAPU32[dssPtr + 4 >> 2]],
                        "depthWriteEnabled": HEAP8[dssPtr + 8 >> 0] !== 0,
                        "depthCompare": WebGPU.CompareFunction[HEAPU32[dssPtr + 12 >> 2]],
                        "stencilFront": makeStencilStateFace(dssPtr + 16),
                        "stencilBack": makeStencilStateFace(dssPtr + 32),
                        "stencilReadMask": HEAPU32[dssPtr + 48 >> 2],
                        "stencilWriteMask": HEAPU32[dssPtr + 52 >> 2],
                        "depthBias": HEAPU32[dssPtr + 56 >> 2],
                        "depthBiasSlopeScale": HEAPF32[dssPtr + 60 >> 2],
                        "depthBiasClamp": HEAPF32[dssPtr + 64 >> 2]
                    }
                }

                function makeVertexAttribute(vaPtr) {
                    return {
                        "format": WebGPU.VertexFormat[HEAPU32[vaPtr >> 2]],
                        "offset": HEAPU32[vaPtr + 4 + 8 >> 2] * 4294967296 + HEAPU32[vaPtr + 8 >> 2],
                        "shaderLocation": HEAPU32[vaPtr + 16 >> 2]
                    }
                }

                function makeVertexAttributes(count, vaArrayPtr) {
                    var vas = [];
                    for (var i = 0; i < count; ++i) {
                        vas.push(makeVertexAttribute(vaArrayPtr + i * 24))
                    }
                    return vas
                }

                function makeVertexBuffer(vbPtr) {
                    if (!vbPtr) return undefined;
                    return {
                        "arrayStride": HEAPU32[vbPtr + 4 >> 2] * 4294967296 + HEAPU32[vbPtr >> 2],
                        "stepMode": WebGPU.VertexStepMode[HEAPU32[vbPtr + 8 >> 2]],
                        "attributes": makeVertexAttributes(HEAPU32[vbPtr + 12 >> 2], HEAPU32[vbPtr + 16 >> 2])
                    }
                }

                function makeVertexBuffers(count, vbArrayPtr) {
                    if (!count) return undefined;
                    var vbs = [];
                    for (var i = 0; i < count; ++i) {
                        vbs.push(makeVertexBuffer(vbArrayPtr + i * 24))
                    }
                    return vbs
                }

                function makeVertexState(viPtr) {
                    if (!viPtr) return undefined;
                    return {
                        "module": WebGPU.mgrShaderModule.get(HEAPU32[viPtr + 4 >> 2]),
                        "entryPoint": UTF8ToString(HEAPU32[viPtr + 8 >> 2]),
                        "constants": WebGPU.makePipelineConstants(HEAPU32[viPtr + 12 >> 2], HEAPU32[viPtr + 16 >> 2]),
                        "buffers": makeVertexBuffers(HEAPU32[viPtr + 20 >> 2], HEAPU32[viPtr + 24 >> 2])
                    }
                }

                function makeMultisampleState(msPtr) {
                    if (!msPtr) return undefined;
                    return {
                        "count": HEAPU32[msPtr + 4 >> 2],
                        "mask": HEAPU32[msPtr + 8 >> 2],
                        "alphaToCoverageEnabled": HEAP8[msPtr + 12 >> 0] !== 0
                    }
                }

                function makeFragmentState(fsPtr) {
                    if (!fsPtr) return undefined;
                    return {
                        "module": WebGPU.mgrShaderModule.get(HEAPU32[fsPtr + 4 >> 2]),
                        "entryPoint": UTF8ToString(HEAPU32[fsPtr + 8 >> 2]),
                        "constants": WebGPU.makePipelineConstants(HEAPU32[fsPtr + 12 >> 2], HEAPU32[fsPtr + 16 >> 2]),
                        "targets": makeColorStates(HEAPU32[fsPtr + 20 >> 2], HEAPU32[fsPtr + 24 >> 2])
                    }
                }
                var desc = {
                    "label": undefined,
                    "layout": WebGPU.mgrPipelineLayout.get(HEAPU32[descriptor + 8 >> 2]),
                    "vertex": makeVertexState(descriptor + 12),
                    "primitive": makePrimitiveState(descriptor + 40),
                    "depthStencil": makeDepthStencilState(HEAPU32[descriptor + 60 >> 2]),
                    "multisample": makeMultisampleState(descriptor + 64),
                    "fragment": makeFragmentState(HEAPU32[descriptor + 80 >> 2])
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrRenderPipeline.create(device["createRenderPipeline"](desc))
            }

            function _wgpuDeviceCreateSampler(deviceId, descriptor) {
                var desc = {
                    "label": undefined,
                    "addressModeU": WebGPU.AddressMode[HEAPU32[descriptor + 8 >> 2]],
                    "addressModeV": WebGPU.AddressMode[HEAPU32[descriptor + 12 >> 2]],
                    "addressModeW": WebGPU.AddressMode[HEAPU32[descriptor + 16 >> 2]],
                    "magFilter": WebGPU.FilterMode[HEAPU32[descriptor + 20 >> 2]],
                    "minFilter": WebGPU.FilterMode[HEAPU32[descriptor + 24 >> 2]],
                    "mipmapFilter": WebGPU.FilterMode[HEAPU32[descriptor + 28 >> 2]],
                    "lodMinClamp": HEAPF32[descriptor + 32 >> 2],
                    "lodMaxClamp": HEAPF32[descriptor + 36 >> 2],
                    "compare": WebGPU.CompareFunction[HEAPU32[descriptor + 40 >> 2]]
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrSampler.create(device["createSampler"](desc))
            }

            function _wgpuDeviceCreateShaderModule(deviceId, descriptor) {
                var nextInChainPtr = HEAPU32[descriptor >> 2];
                var sType = HEAPU32[nextInChainPtr + 4 >> 2];
                var desc = {
                    "label": undefined,
                    "code": ""
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                switch (sType) {
                    case 5: {
                        var count = HEAPU32[nextInChainPtr + 8 >> 2];
                        var start = HEAPU32[nextInChainPtr + 12 >> 2];
                        desc["code"] = HEAPU32.subarray(start >> 2, (start >> 2) + count);
                        break
                    }
                    case 6: {
                        var sourcePtr = HEAPU32[nextInChainPtr + 8 >> 2];
                        if (sourcePtr) {
                            desc["code"] = UTF8ToString(sourcePtr)
                        }
                        break
                    }
                }
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrShaderModule.create(device["createShaderModule"](desc))
            }

            function _wgpuDeviceCreateSwapChain(deviceId, surfaceId, descriptor) {
                var device = WebGPU.mgrDevice.get(deviceId);
                var context = WebGPU.mgrSurface.get(surfaceId);
                var canvasSize = [HEAPU32[descriptor + 16 >> 2], HEAPU32[descriptor + 20 >> 2]];
                if (canvasSize[0] !== 0) {
                    context["canvas"]["width"] = canvasSize[0]
                }
                if (canvasSize[1] !== 0) {
                    context["canvas"]["height"] = canvasSize[1]
                }
                var configuration = {
                    "device": device,
                    "format": WebGPU.TextureFormat[HEAPU32[descriptor + 12 >> 2]],
                    "usage": HEAPU32[descriptor + 8 >> 2],
                    "alphaMode": "opaque"
                };
                context["configure"](configuration);
                return WebGPU.mgrSwapChain.create(context)
            }

            function _wgpuDeviceCreateTexture(deviceId, descriptor) {
                var desc = {
                    "label": undefined,
                    "size": WebGPU.makeExtent3D(descriptor + 16),
                    "mipLevelCount": HEAPU32[descriptor + 32 >> 2],
                    "sampleCount": HEAPU32[descriptor + 36 >> 2],
                    "dimension": WebGPU.TextureDimension[HEAPU32[descriptor + 12 >> 2]],
                    "format": WebGPU.TextureFormat[HEAPU32[descriptor + 28 >> 2]],
                    "usage": HEAPU32[descriptor + 8 >> 2]
                };
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) desc["label"] = UTF8ToString(labelPtr);
                var viewFormatCount = HEAPU32[descriptor + 40 >> 2];
                if (viewFormatCount) {
                    var viewFormatsPtr = HEAPU32[descriptor + 44 >> 2];
                    desc["viewFormats"] = Array.from(HEAP32.subarray(viewFormatsPtr >> 2, (viewFormatsPtr >> 2) + viewFormatCount), function(format) {
                        return WebGPU.TextureFormat[format]
                    })
                }
                var device = WebGPU.mgrDevice.get(deviceId);
                return WebGPU.mgrTexture.create(device["createTexture"](desc))
            }

            function _wgpuDeviceGetQueue(deviceId) {
                var queueId = WebGPU.mgrDevice.objects[deviceId].queueId;
                WebGPU.mgrQueue.reference(queueId);
                return queueId
            }

            function _wgpuDeviceRelease(id) {
                WebGPU.mgrDevice.release(id)
            }

            function maybeCStringToJsString(cString) {
                return cString > 2 ? UTF8ToString(cString) : cString
            }
            var specialHTMLTargets = [0, document, window];

            function findEventTarget(target) {
                target = maybeCStringToJsString(target);
                var domElement = specialHTMLTargets[target] || document.querySelector(target);
                return domElement
            }

            function findCanvasEventTarget(target) {
                return findEventTarget(target)
            }

            function _wgpuInstanceCreateSurface(instanceId, descriptor) {
                var nextInChainPtr = HEAPU32[descriptor >> 2];
                var descriptorFromCanvasHTMLSelector = nextInChainPtr;
                var selectorPtr = HEAPU32[descriptorFromCanvasHTMLSelector + 8 >> 2];
                var canvas = findCanvasEventTarget(selectorPtr);
                var context = canvas.getContext("webgpu");
                if (!context) return 0;
                var labelPtr = HEAPU32[descriptor + 4 >> 2];
                if (labelPtr) context.surfaceLabelWebGPU = UTF8ToString(labelPtr);
                return WebGPU.mgrSurface.create(context)
            }

            function _wgpuInstanceRelease() {}

            function callUserCallback(func) {
                if (ABORT) {
                    return
                }
                try {
                    func()
                } catch (e) {
                    handleException(e)
                }
            }

            function allocateUTF8(str) {
                var size = lengthBytesUTF8(str) + 1;
                var ret = _malloc(size);
                if (ret) stringToUTF8Array(str, HEAP8, ret, size);
                return ret
            }

            function _wgpuInstanceRequestAdapter(instanceId, options, callback, userdata) {
                var opts;
                if (options) {
                    opts = {
                        "powerPreference": WebGPU.PowerPreference[HEAPU32[options + 8 >> 2]],
                        "forceFallbackAdapter": HEAP8[options + 12 >> 0] !== 0
                    }
                }
                if (!("gpu" in navigator)) {
                    var messagePtr = allocateUTF8("WebGPU not available on this browser (navigator.gpu is not available)");
                    getWasmTableEntry(callback)(1, 0, messagePtr, userdata);
                    _free(messagePtr);
                    return
                }
                navigator["gpu"]["requestAdapter"](opts).then(function(adapter) {
                    callUserCallback(function() {
                        if (adapter) {
                            var adapterId = WebGPU.mgrAdapter.create(adapter);
                            getWasmTableEntry(callback)(0, adapterId, 0, userdata)
                        } else {
                            var messagePtr = allocateUTF8("WebGPU not available on this system (requestAdapter returned null)");
                            getWasmTableEntry(callback)(1, 0, messagePtr, userdata);
                            _free(messagePtr)
                        }
                    })
                }, function(ex) {
                    callUserCallback(function() {
                        var messagePtr = allocateUTF8(ex.message);
                        getWasmTableEntry(callback)(2, 0, messagePtr, userdata);
                        _free(messagePtr)
                    })
                })
            }

            function _wgpuPipelineLayoutRelease(id) {
                WebGPU.mgrPipelineLayout.release(id)
            }

            function _wgpuQuerySetDestroy(querySetId) {
                WebGPU.mgrQuerySet.get(querySetId)["destroy"]()
            }

            function _wgpuQuerySetRelease(id) {
                WebGPU.mgrQuerySet.release(id)
            }

            function _wgpuQueueOnSubmittedWorkDone(queueId, signalValue_low, signalValue_high, callback, userdata) {
                var queue = WebGPU.mgrQueue.get(queueId);
                queue["onSubmittedWorkDone"]().then(function() {
                    callUserCallback(function() {
                        getWasmTableEntry(callback)(0, userdata)
                    })
                }, function() {
                    callUserCallback(function() {
                        getWasmTableEntry(callback)(1, userdata)
                    })
                })
            }

            function _wgpuQueueRelease(id) {
                WebGPU.mgrQueue.release(id)
            }

            function _wgpuQueueSubmit(queueId, commandCount, commands) {
                var queue = WebGPU.mgrQueue.get(queueId);
                var cmds = Array.from(HEAP32.subarray(commands >> 2, (commands >> 2) + commandCount), function(id) {
                    return WebGPU.mgrCommandBuffer.get(id)
                });
                queue["submit"](cmds)
            }

            function _wgpuQueueWriteBuffer(queueId, bufferId, bufferOffset_low, bufferOffset_high, data, size) {
                var queue = WebGPU.mgrQueue.get(queueId);
                var buffer = WebGPU.mgrBuffer.get(bufferId);
                var bufferOffset = bufferOffset_high * 4294967296 + bufferOffset_low;
                var subarray = HEAPU8.subarray(data, data + size);
                queue["writeBuffer"](buffer, bufferOffset, subarray, 0, size)
            }

            function _wgpuQueueWriteTexture(queueId, destinationPtr, data, dataSize, dataLayoutPtr, writeSizePtr) {
                var queue = WebGPU.mgrQueue.get(queueId);
                var destination = WebGPU.makeImageCopyTexture(destinationPtr);
                var dataLayout = WebGPU.makeTextureDataLayout(dataLayoutPtr);
                var writeSize = WebGPU.makeExtent3D(writeSizePtr);
                var subarray = HEAPU8.subarray(data, data + dataSize);
                queue["writeTexture"](destination, subarray, dataLayout, writeSize)
            }

            function _wgpuRenderPassEncoderDraw(passId, vertexCount, instanceCount, firstVertex, firstInstance) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["draw"](vertexCount, instanceCount, firstVertex, firstInstance)
            }

            function _wgpuRenderPassEncoderDrawIndexed(passId, indexCount, instanceCount, firstIndex, baseVertex, firstInstance) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["drawIndexed"](indexCount, instanceCount, firstIndex, baseVertex, firstInstance)
            }

            function _wgpuRenderPassEncoderDrawIndirect(passId, indirectBufferId, indirectOffset_low, indirectOffset_high) {
                var indirectBuffer = WebGPU.mgrBuffer.get(indirectBufferId);
                var indirectOffset = indirectOffset_high * 4294967296 + indirectOffset_low;
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["drawIndirect"](indirectBuffer, indirectOffset)
            }

            function _wgpuRenderPassEncoderEnd(passId) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["end"]()
            }

            function _wgpuRenderPassEncoderRelease(id) {
                WebGPU.mgrRenderPassEncoder.release(id)
            }

            function _wgpuRenderPassEncoderSetBindGroup(passId, groupIndex, groupId, dynamicOffsetCount, dynamicOffsetsPtr) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                var group = WebGPU.mgrBindGroup.get(groupId);
                if (dynamicOffsetCount == 0) {
                    pass["setBindGroup"](groupIndex, group)
                } else {
                    var offsets = [];
                    for (var i = 0; i < dynamicOffsetCount; i++, dynamicOffsetsPtr += 4) {
                        offsets.push(HEAPU32[dynamicOffsetsPtr >> 2])
                    }
                    pass["setBindGroup"](groupIndex, group, offsets)
                }
            }

            function _wgpuRenderPassEncoderSetBlendConstant(passId, colorPtr) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                var color = WebGPU.makeColor(colorPtr);
                pass["setBlendConstant"](color)
            }

            function _wgpuRenderPassEncoderSetIndexBuffer(passId, bufferId, format, offset_low, offset_high, size_low, size_high) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                var buffer = WebGPU.mgrBuffer.get(bufferId);
                var offset = offset_high * 4294967296 + offset_low;
                var size = size_high === -1 && size_low === -1 ? undefined : size_high * 4294967296 + size_low;
                pass["setIndexBuffer"](buffer, WebGPU.IndexFormat[format], offset, size)
            }

            function _wgpuRenderPassEncoderSetPipeline(passId, pipelineId) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                var pipeline = WebGPU.mgrRenderPipeline.get(pipelineId);
                pass["setPipeline"](pipeline)
            }

            function _wgpuRenderPassEncoderSetScissorRect(passId, x, y, w, h) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["setScissorRect"](x, y, w, h)
            }

            function _wgpuRenderPassEncoderSetStencilReference(passId, reference) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["setStencilReference"](reference)
            }

            function _wgpuRenderPassEncoderSetVertexBuffer(passId, slot, bufferId, offset_low, offset_high, size_low, size_high) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                var buffer = WebGPU.mgrBuffer.get(bufferId);
                var offset = offset_high * 4294967296 + offset_low;
                var size = size_high === -1 && size_low === -1 ? undefined : size_high * 4294967296 + size_low;
                pass["setVertexBuffer"](slot, buffer, offset, size)
            }

            function _wgpuRenderPassEncoderSetViewport(passId, x, y, w, h, minDepth, maxDepth) {
                var pass = WebGPU.mgrRenderPassEncoder.get(passId);
                pass["setViewport"](x, y, w, h, minDepth, maxDepth)
            }

            function _wgpuRenderPipelineRelease(id) {
                WebGPU.mgrRenderPipeline.release(id)
            }

            function _wgpuSamplerRelease(id) {
                WebGPU.mgrSampler.release(id)
            }

            function _wgpuShaderModuleRelease(id) {
                WebGPU.mgrShaderModule.release(id)
            }

            function _wgpuSurfaceRelease(id) {
                WebGPU.mgrSurface.release(id)
            }

            function _wgpuSwapChainGetCurrentTextureView(swapChainId) {
                var context = WebGPU.mgrSwapChain.get(swapChainId);
                return WebGPU.mgrTextureView.create(context["getCurrentTexture"]()["createView"]())
            }

            function _wgpuSwapChainRelease(id) {
                WebGPU.mgrSwapChain.release(id)
            }

            function _wgpuTextureCreateView(textureId, descriptor) {
                var desc;
                if (descriptor) {
                    var mipLevelCount = HEAPU32[descriptor + 20 >> 2];
                    var arrayLayerCount = HEAPU32[descriptor + 28 >> 2];
                    desc = {
                        "format": WebGPU.TextureFormat[HEAPU32[descriptor + 8 >> 2]],
                        "dimension": WebGPU.TextureViewDimension[HEAPU32[descriptor + 12 >> 2]],
                        "baseMipLevel": HEAPU32[descriptor + 16 >> 2],
                        "mipLevelCount": mipLevelCount === 4294967295 ? undefined : mipLevelCount,
                        "baseArrayLayer": HEAPU32[descriptor + 24 >> 2],
                        "arrayLayerCount": arrayLayerCount === 4294967295 ? undefined : arrayLayerCount,
                        "aspect": WebGPU.TextureAspect[HEAPU32[descriptor + 32 >> 2]]
                    };
                    var labelPtr = HEAPU32[descriptor + 4 >> 2];
                    if (labelPtr) desc["label"] = UTF8ToString(labelPtr)
                }
                var texture = WebGPU.mgrTexture.get(textureId);
                return WebGPU.mgrTextureView.create(texture["createView"](desc))
            }

            function _wgpuTextureDestroy(textureId) {
                WebGPU.mgrTexture.get(textureId)["destroy"]()
            }

            function _wgpuTextureRelease(id) {
                WebGPU.mgrTexture.release(id)
            }

            function _wgpuTextureViewRelease(id) {
                WebGPU.mgrTextureView.release(id)
            }

            function warnOnce(text) {
                if (!warnOnce.shown) warnOnce.shown = {};
                if (!warnOnce.shown[text]) {
                    warnOnce.shown[text] = 1;
                    err(text)
                }
            }
            InternalError = Module["InternalError"] = extendError(Error, "InternalError");
            embind_init_charCodes();
            BindingError = Module["BindingError"] = extendError(Error, "BindingError");
            init_ClassHandle();
            init_embind();
            init_RegisteredPointer();
            UnboundTypeError = Module["UnboundTypeError"] = extendError(Error, "UnboundTypeError");
            init_emval();
            WebGPU.initManagers();
            var asmLibraryArg = {
                "h": __embind_finalize_value_object,
                "Ta": __embind_register_bigint,
                "na": __embind_register_bool,
                "m": __embind_register_class,
                "K": __embind_register_class_class_function,
                "q": __embind_register_class_constructor,
                "d": __embind_register_class_function,
                "c": __embind_register_class_property,
                "ma": __embind_register_emval,
                "Q": __embind_register_float,
                "s": __embind_register_integer,
                "r": __embind_register_memory_view,
                "R": __embind_register_std_string,
                "D": __embind_register_std_wstring,
                "i": __embind_register_value_object,
                "a": __embind_register_value_object_field,
                "oa": __embind_register_void,
                "k": __emval_as,
                "V": __emval_call_void_method,
                "b": __emval_decref,
                "W": __emval_get_method_caller,
                "g": __emval_get_property,
                "l": __emval_incref,
                "p": __emval_new_array,
                "n": __emval_new_cstring,
                "j": __emval_run_destructors,
                "o": __emval_set_property,
                "f": __emval_take_value,
                "e": _abort,
                "ka": _emscripten_memcpy_big,
                "C": _emscripten_resize_heap,
                "Ba": _emscripten_webgpu_get_device,
                "ha": _environ_get,
                "ia": _environ_sizes_get,
                "ja": _fd_write,
                "P": _setTempRet0,
                "Ga": _wgpuAdapterGetProperties,
                "J": _wgpuAdapterHasFeature,
                "Da": _wgpuAdapterRelease,
                "Ha": _wgpuBindGroupRelease,
                "ca": _wgpuBufferDestroy,
                "O": _wgpuBufferGetMappedRange,
                "ba": _wgpuBufferRelease,
                "B": _wgpuBufferUnmap,
                "N": _wgpuCommandBufferRelease,
                "Ja": _wgpuCommandEncoderBeginComputePass,
                "pa": _wgpuCommandEncoderBeginRenderPass,
                "Wa": _wgpuCommandEncoderCopyBufferToBuffer,
                "da": _wgpuCommandEncoderCopyBufferToTexture,
                "Ka": _wgpuCommandEncoderCopyTextureToTexture,
                "u": _wgpuCommandEncoderFinish,
                "x": _wgpuCommandEncoderRelease,
                "Ia": _wgpuComputePassEncoderDispatchWorkgroups,
                "Va": _wgpuComputePassEncoderDispatchWorkgroupsIndirect,
                "ya": _wgpuComputePassEncoderEnd,
                "wa": _wgpuComputePassEncoderRelease,
                "Sa": _wgpuComputePassEncoderSetBindGroup,
                "Ra": _wgpuComputePassEncoderSetPipeline,
                "S": _wgpuComputePipelineRelease,
                "M": _wgpuDeviceCreateBindGroup,
                "L": _wgpuDeviceCreateBindGroupLayout,
                "v": _wgpuDeviceCreateBuffer,
                "y": _wgpuDeviceCreateCommandEncoder,
                "va": _wgpuDeviceCreateComputePipeline,
                "xa": _wgpuDeviceCreatePipelineLayout,
                "ua": _wgpuDeviceCreateRenderPipeline,
                "ta": _wgpuDeviceCreateSampler,
                "G": _wgpuDeviceCreateShaderModule,
                "qa": _wgpuDeviceCreateSwapChain,
                "E": _wgpuDeviceCreateTexture,
                "Y": _wgpuDeviceGetQueue,
                "Ca": _wgpuDeviceRelease,
                "Aa": _wgpuInstanceCreateSurface,
                "Ea": _wgpuInstanceRelease,
                "za": _wgpuInstanceRequestAdapter,
                "U": _wgpuPipelineLayoutRelease,
                "_": _wgpuQuerySetDestroy,
                "Z": _wgpuQuerySetRelease,
                "Ua": _wgpuQueueOnSubmittedWorkDone,
                "I": _wgpuQueueRelease,
                "z": _wgpuQueueSubmit,
                "ga": _wgpuQueueWriteBuffer,
                "X": _wgpuQueueWriteTexture,
                "La": _wgpuRenderPassEncoderDraw,
                "ea": _wgpuRenderPassEncoderDrawIndexed,
                "Xa": _wgpuRenderPassEncoderDrawIndirect,
                "la": _wgpuRenderPassEncoderEnd,
                "Za": _wgpuRenderPassEncoderRelease,
                "A": _wgpuRenderPassEncoderSetBindGroup,
                "Pa": _wgpuRenderPassEncoderSetBlendConstant,
                "Ya": _wgpuRenderPassEncoderSetIndexBuffer,
                "Qa": _wgpuRenderPassEncoderSetPipeline,
                "Na": _wgpuRenderPassEncoderSetScissorRect,
                "Ma": _wgpuRenderPassEncoderSetStencilReference,
                "fa": _wgpuRenderPassEncoderSetVertexBuffer,
                "Oa": _wgpuRenderPassEncoderSetViewport,
                "T": _wgpuRenderPipelineRelease,
                "sa": _wgpuSamplerRelease,
                "H": _wgpuShaderModuleRelease,
                "Fa": _wgpuSurfaceRelease,
                "F": _wgpuSwapChainGetCurrentTextureView,
                "ra": _wgpuSwapChainRelease,
                "w": _wgpuTextureCreateView,
                "aa": _wgpuTextureDestroy,
                "$": _wgpuTextureRelease,
                "t": _wgpuTextureViewRelease
            };
            var asm = createWasm();
            var ___wasm_call_ctors = Module["___wasm_call_ctors"] = function() {
                return (___wasm_call_ctors = Module["___wasm_call_ctors"] = Module["asm"]["$a"]).apply(null, arguments)
            };
            var _malloc = Module["_malloc"] = function() {
                return (_malloc = Module["_malloc"] = Module["asm"]["bb"]).apply(null, arguments)
            };
            var _free = Module["_free"] = function() {
                return (_free = Module["_free"] = Module["asm"]["cb"]).apply(null, arguments)
            };
            var ___getTypeName = Module["___getTypeName"] = function() {
                return (___getTypeName = Module["___getTypeName"] = Module["asm"]["db"]).apply(null, arguments)
            };
            var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = function() {
                return (___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = Module["asm"]["eb"]).apply(null, arguments)
            };
            var dynCall_jii = Module["dynCall_jii"] = function() {
                return (dynCall_jii = Module["dynCall_jii"] = Module["asm"]["fb"]).apply(null, arguments)
            };
            var dynCall_viij = Module["dynCall_viij"] = function() {
                return (dynCall_viij = Module["dynCall_viij"] = Module["asm"]["gb"]).apply(null, arguments)
            };
            var dynCall_jiji = Module["dynCall_jiji"] = function() {
                return (dynCall_jiji = Module["dynCall_jiji"] = Module["asm"]["hb"]).apply(null, arguments)
            };
            var calledRun;
            dependenciesFulfilled = function runCaller() {
                if (!calledRun) run();
                if (!calledRun) dependenciesFulfilled = runCaller
            };

            function run(args) {
                args = args || arguments_;
                if (runDependencies > 0) {
                    return
                }
                preRun();
                if (runDependencies > 0) {
                    return
                }

                function doRun() {
                    if (calledRun) return;
                    calledRun = true;
                    Module["calledRun"] = true;
                    if (ABORT) return;
                    initRuntime();
                    readyPromiseResolve(Module);
                    if (Module["onRuntimeInitialized"]) Module["onRuntimeInitialized"]();
                    postRun()
                }
                if (Module["setStatus"]) {
                    Module["setStatus"]("Running...");
                    setTimeout(function() {
                        setTimeout(function() {
                            Module["setStatus"]("")
                        }, 1);
                        doRun()
                    }, 1)
                } else {
                    doRun()
                }
            }
            if (Module["preInit"]) {
                if (typeof Module["preInit"] == "function") Module["preInit"] = [Module["preInit"]];
                while (Module["preInit"].length > 0) {
                    Module["preInit"].pop()()
                }
            }
            run();


            return wasmDevice.ready
        }
    );
})();
export default wasmDevice;