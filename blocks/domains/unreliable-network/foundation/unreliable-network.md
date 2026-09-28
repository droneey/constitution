# Unreliable network

## every-request-has-a-timeout · MUST
Every request over the network has a timeout and can be cancelled.
**Why:** on an unreliable network a request without a timeout eventually hangs, and the user waits for nothing.
**Check:** review
**Tags:** errors, performance
**Implements:** `io-has-timeout-and-cancellation`

## connection-loss-is-an-expected-failure · MUST
A timeout or a lost connection is an expected, typed failure the user sees and can retry, never a hang or a silent loss.
**Why:** on this network it will happen; a program that treats it as a defect fails its users every day.
**Check:** review
**Tags:** errors, ux
**Implements:** `expected-failures-typed-with-codes`

## user-input-survives-connection-loss · SHOULD
Input the user entered survives a failed request and is sent again without being typed again.
**Why:** a user who loses their input to a dropped connection does not type it twice.
**Check:** review
**Tags:** ux

## network-failures-have-cases · SHOULD
A request's timeout and its lost connection each have a test case.
**Why:** these failures are rare on a developer's machine and common in the field, so only a test exercises them before a user does.
**Check:** test
**Tags:** testing, errors
**Implements:** `every-declared-failure-has-a-case`
