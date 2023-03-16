
# Class: AlreadyRunningException

## Hierarchy

* Error

  ↳ **AlreadyRunningException**

## Index

### Constructors

* [constructor](alreadyrunningexception.md#constructor)

### Properties

* [functionReference](alreadyrunningexception.md#functionreference)
* [lockDurationInSeconds](alreadyrunningexception.md#lockdurationinseconds)
* [message](alreadyrunningexception.md#message)
* [name](alreadyrunningexception.md#name)
* [stack](alreadyrunningexception.md#optional-stack)
* [Error](alreadyrunningexception.md#static-error)

## Constructors

###  constructor

\+ **new AlreadyRunningException**(`functionReference`: string, `lockDurationInSeconds`: number): *[AlreadyRunningException](alreadyrunningexception.md)*

*Defined in [src/lib/mutex.ts:5](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/mutex.ts#L5)*

**Parameters:**

Name | Type |
------ | ------ |
`functionReference` | string |
`lockDurationInSeconds` | number |

**Returns:** *[AlreadyRunningException](alreadyrunningexception.md)*

## Properties

###  functionReference

• **functionReference**: *string*

*Defined in [src/lib/mutex.ts:4](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/mutex.ts#L4)*

___

###  lockDurationInSeconds

• **lockDurationInSeconds**: *number*

*Defined in [src/lib/mutex.ts:5](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/mutex.ts#L5)*

___

###  message

• **message**: *string*

*Inherited from void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:974

___

###  name

• **name**: *string*

*Overrides void*

*Defined in [src/lib/mutex.ts:2](https://github.com/Gapminder/gapminder-igno-survey-processing/blob/v0.6.0/gsheets-addon/src/lib/mutex.ts#L2)*

___

### `Optional` stack

• **stack**? : *string*

*Inherited from void*

*Overrides void*

Defined in node_modules/typescript/lib/lib.es5.d.ts:975

___

### `Static` Error

▪ **Error**: *ErrorConstructor*

Defined in node_modules/typescript/lib/lib.es5.d.ts:984
