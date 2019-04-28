/*
 *  BSD 3-Clause License
 *
 * Copyright (c) 2018, Sidharth Mishra
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 *
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 *
 * * Neither the name of the copyright holder nor the names of its
 *   contributors may be used to endorse or promote products derived from
 *   this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * optional.ts
 * @author Sidharth Mishra
 * @created Sat Apr 27 2019 21:45:41 GMT-0700 (PDT)
 * @last-modified Sat Apr 27 2019 22:22:22 GMT-0700 (PDT)
 */

/**
 * An optional type that works great with nullable values. Inspired by Java's Optional and Haskell's Maybe monad.
 */
export class Optional<T> {
    /**
     * Makes an Optional value that is guratanteed to be non-null!
     * @param nonNullableVal the non null value
     * @throws Error if the value passed in is null.
     * @returns an Optional of T
     * @param T the type of Optional
     */
    public static of<T>(nonNullableVal: T): Optional<T> {
        if (!nonNullableVal) {
            throw new Error('value cannot be null! Did you mean to use ofNullable instead?');
        }
        return new Optional<T>(nonNullableVal);
    }

    /**
     * Makes an optional value that may be null.
     * @param nullableVal a value that can be null.
     * @returns an Optional that can be null.
     */
    public static ofNullable<T>(nullableVal: T): Optional<T> {
        return new Optional<T>(nullableVal);
    }

    /**
     * Returns empty, symbolizing nothing!
     * @returns Empty or nothing-ness.
     */
    public static empty<T>(): Empty {
        return Empty.get();
    }

    private _value: T;

    private constructor(val: T) {
        this._value = val;
    }

    /**
     * Gets the value of the Maybe or Optional type if it is not null. Throws an error otherwise.
     * @returns the not null value
     * @throws Error if the value is null.
     */
    public get(): T {
        if (!this._value) {
            throw new Error('The value cannot be null!');
        }
        return this._value;
    }

    /**
     * A terminal operation that is executed iff the value is not null.
     * @param consumer the consumer function.
     */
    public ifPresent(consumer: (val: T) => void) {
        if (this._value) {
            consumer(this._value);
        }
    }

    /**
     * Gets the non-null value if present, else returns the alternate value. The alternate value could be null.
     * @param alternate the alternate value, could be null
     * @returns the value if not-null, else the alternate value which may be null.
     */
    public orElse(alternate: T): T {
        if (this._value) {
            return this._value;
        }
        return alternate;
    }

    /**
     * If the predicate evaluates to true, then, returns the same Optional, else returns Empty.
     * @param predicate the predicate function that unwraps the Optional and checks for the condition by applying its value.
     * @returns the Optional back if predicate evaluates to true, else returns Empty.
     */
    public filter(predicate: (val: T) => boolean): Optional<T> | Empty {
        if (this._value) {
            if (predicate(this._value)) {
                return this;
            }
        }
        return Optional.empty();
    }

    /**
     * Transforms the value of the Optional type by unwrapping it, and produces another Optional which may be of another type.
     * If the unwrapped value is null, returns an Empty symbolizing end of operations.
     * @param transformer the pure function that transforms T -> U
     * @returns Optional of type U if the unwrapped value is not nullable, else returns Empty.
     */
    public map<U>(transformer: (val: T) => U): Optional<U> | Empty {
        if (this._value) {
            return Optional.ofNullable(transformer(this._value));
        }
        return Optional.empty();
    }
}

/**
 * Empty symbolizes the Empty condition, it is a singular value.
 */
export class Empty {
    private static instance: Empty;

    public static get(): Empty {
        if (Empty.instance) return Empty.instance;
        Empty.instance = new Empty();
        return Empty.instance;
    }

    private constructor() {}

    /**
     * API similarity to Optional. But throws Error.
     * @throws Error.
     */
    public get(): Empty {
        throw new Error('There is nothing to get from nothingness!!!');
    }

    /**
     * API similarity to Optional. But throws Error.
     * @throws Error.
     */
    public map(f: (v: any) => any): Empty {
        throw new Error('Cannot transform nothingness!!');
    }

    /**
     * API similarity to Optional. But throws Error.
     * @throws Error.
     */
    public filter(f: (v: any) => boolean): Empty {
        throw new Error('Nothingness cannot be filtered!');
    }

    /**
     * API similarity to Optional. Does nothing!
     */
    public ifPresent(f: (v: any) => void) {}

    /**
     * An identity function, else when comparing with nothingness, everything seems feasible.
     * @param v the other value, could be null
     * @returns the alternate value.
     */
    public orElse(v: any): any {
        return v;
    }
}
