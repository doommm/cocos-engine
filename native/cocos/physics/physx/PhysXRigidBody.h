/****************************************************************************
 Copyright (c) 2020-2021 Xiamen Yaji Software Co., Ltd.

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

#pragma once

#include "base/Macros.h"
#include "physics/physx//PhysXInc.h"
#include "physics/physx/PhysXSharedBody.h"
#include "physics/spec/IBody.h"

namespace cc {
namespace physics {

class PhysXRigidBody final : public IRigidBody {
public:
    PhysXRigidBody();
    ~PhysXRigidBody() override;
    inline bool isEnabled() const { return _mEnabled; }
    inline const PhysXSharedBody &getSharedBody() const { return *_mSharedBody; }
    inline PhysXSharedBody &getSharedBody() { return *_mSharedBody; }
    void initialize(Node *node, ERigidBodyType t, uint32_t g) override;
    void onEnable() override;
    void onDisable() override;
    void onDestroy() override;
    bool isAwake() override;
    bool isSleepy() override;
    bool isSleeping() override;
    void setType(ERigidBodyType v) override;
    void setMass(float v) override;
    void setLinearDamping(float v) override;
    void setAngularDamping(float v) override;
    void useGravity(bool v) override;
    void useCCD(bool v) override;
    void setLinearFactor(float x, float y, float z) override;
    void setAngularFactor(float x, float y, float z) override;
    void setAllowSleep(bool v) override;
    void wakeUp() override;
    void sleep() override;
    void clearState() override;
    void clearForces() override;
    void clearVelocity() override;
    void setSleepThreshold(float v) override;
    float getSleepThreshold() override;
    cc::Vec3 getLinearVelocity() override;
    void setLinearVelocity(float x, float y, float z) override;
    cc::Vec3 getAngularVelocity() override;
    void setAngularVelocity(float x, float y, float z) override;
    void applyForce(float x, float y, float z, float rx, float ry, float rz) override;
    void applyLocalForce(float x, float y, float z, float rx, float ry, float rz) override;
    void applyImpulse(float x, float y, float z, float rx, float ry, float rz) override;
    void applyLocalImpulse(float x, float y, float z, float rx, float ry, float rz) override;
    void applyTorque(float x, float y, float z) override;
    void applyLocalTorque(float x, float y, float z) override;
    uint32_t getGroup() override;
    uint32_t getMask() override;
    void setGroup(uint32_t g) override;
    void setMask(uint32_t m) override;
    inline uint32_t getInitialGroup() const { return _mGroup; }
    uint32_t getObjectID() const override { return _mObjectID; };

protected:
    // physx::PhysXWorld* mWrappedWorld;
    PhysXSharedBody *_mSharedBody{nullptr};
    uint32_t _mGroup{1};
    bool _mEnabled{false};
    uint32_t _mObjectID{0};
};

} // namespace physics
} // namespace cc
