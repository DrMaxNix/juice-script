# juice-script
![JuiceScript](https://raw.githubusercontent.com/DrMaxNix/juice-script/main/assets/logo/256.png)

[![GitHub release](https://img.shields.io/github/release/DrMaxNix/juice-script.svg?logo=github)](https://github.com/DrMaxNix/juice-script/releases/latest)
[![License](https://img.shields.io/badge/license-MIT-green)](https://github.com/DrMaxNix/juice-script/blob/main/LICENSE)
[![Maintaner](https://img.shields.io/badge/maintainer-DrMaxNix-orange)](https://www.drmaxnix.de)

Educational programming language for teaching Assembly to beginners



## Example
```ruby
set $q 0

loop:
	echo $q
	add $q 1

if $q < 10
	jump "loop"
```

```
0
1
2
3
4
5
6
7
8
9
```
