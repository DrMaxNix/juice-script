## COMMENTS ##
# one-line comments (from prefix to EOL)
mov $a 42 # comment
mov $a 42 // comment
mov $a 42 ; comment

# block comments
/*
	Block comment
*/

/* Also a block comment */

mov /* Inline block comment */ $a 42


## ESCAPE SEQUENCES AND INTEGER PREFIXES ##
# in strings (only those in double quotes)
"\n"		# newline
"\t"		# tab
"\u2764\ufe0f"	# utf-8 for ❤️
...

# integers
0x10		# hexadecimal:	16
0o10		# octal:	8
0b0100		# binary:	4



## VARIABLES ##
# $2 => $1
move|mov|set $1 $2

# load $1 from root scope into current scope
glob|global|pub|public $1

# vartypes (constants containing string of vartype name)
null			# null
true|false		# bool
eg. -44 27 287634	# int
eg. 4.0 -3.0 0.125	# float
eg. "bla" 'blub'	# str

# vartype($1) => $1
typ|type $1

# cast $1 to type-string stored in $2 / to int
cst|cast $1 $2
cst|cast $1 "int"
cst|cast $1 int

# use contents of a var as var-name (todo: is there a more assembly-like way for this?)
${$name}



## MATH ##
# $1 + $2 + ... => $1
add $1 $2 ...

# $1 - ($2 + ...) => $1
sub $1 $2 ...

# $1 * $2 * ... => $1
mul $1 $2 ...

# $1 / ($2 * ...) => $1
div $1 $2 ...

# $1 % $2 % ... => $1
mod $1 $2 ...

# $1 ^ $2 ^ ... => $1
pow $1 $2 ...

# root of $1 (power = $2; if not given: square-root) => $1
root $1 $2

# log of $1 (base = $2; if not given: base = 2) => $1
log $1 $2

# round to the nearest integer (.000 - .499 => round down; .500 - 0.999 => round up) => $1
round $1

# round up to the next integer => $1
ceil $1

# round down to the last integer => $1
floor $1



## CONDITIONS ##
# only execute next line if cond is true
ifl cond

# skip next line if cond is true
ifn cond

# cond:
x
!x
x == y
x != y
x === y
x !== y
x < y
x <= y
x > y
x >= y



## JUMPS ##
# jump to line 42 (jumping to lines inside of other scopes is not allowed)
jmp|jump|goto 42

# jump to a flag called "flag1" (flags are stored per-scope)
jmp|jump|goto "flag1"

# set flag called "flag1"
:flag1	|	:flag1:	|	flag1:



## TEXT IO ##
# print "blabliblub"
drw|draw|echo "bla" "bli" "blub"

# print "blabliblub", await user response (until newline/enter) and return entered line as $1
ask $1 "bla" "bli" "blub"



## GRAPHICAL OUTPUT ##
# initialize matrix with 16x16
pxl|pixel|canv|canvas size 16 16	|	pxl|pixel|canv|canvas size 16

# set output resolution to 256x256
pxl|pixel|canv|canvas res 256 256	|	pxl|pixel|canv|canvas res 256

# enable autodraw
pxl|pixel|canv|canvas autodraw true

# set pixel at 2|12 to color #F6F6F6
pxl|pixel|canv|canvas set 2 12 "F6"

# update matrix to screen
pxl|pixel|canv|canvas draw



## FUNCTIONS ##
# - functions have their own scopes
# - they can call other functions
# - their own vars are private
# - they can't acces root-scope's vars (except they were made global using `glob`)
# - args are copied into local scope
# - args with &-prefix modify corresponding var in global scope

# the function scope "myfunction1" starts here
# argument $1 is readonly; $2 is read/write
fcn|def myfunction1 $1 &$2

# current function scope ends here
end

# call a function called "myfunction1"
# arg $1 = 42; arg $2 = $test (returned to parent scope)
myfunction1 42 $test



## RETURN, END, ETC. ##
# halt the programm
halt

# return from function to parent scope
# halt programm in root scope
exit|return|end



## LISTS ##
# - if a list index is undefined, its value will be `null`

# set $a to empty list
set $a []

# set $a to list
set $a [1, 5, 2345]

# print 2nd element of 4th list
echo $a[3][1]

# remove 2nd element (maintaining key association)
set $a[1] null

# push element
set $a[] "blabla"	|	add $a "blabla"

# print last element
echo $a[-1]

# remove (and get) last element (keys will be re-ordered)
pop $a[-1]	|	pop $a[-1] $b

# get list length
len $list $length_num



## EXTERNAL VALUES ##
# get unix time
time $time

# get formated time
time $time "YYYY-MM-DD"

# get random integer between 0 and 3
rnd|rand|random $num 3

# get random integer between 5 and 13
rnd|rand|random $num 5 13



## STRING MANIPULATION ##
# get utf-8 char with id $1
chr $1	|	cast $1 str

# get string lenght
len $string $length_num

# concat strings => $a
add $a $b ...

# get substr 2(-5)
slice|substr $string 2 5	|	slice|substr $string 2

# repeat string
mul $string 3

# get position of first occourance of needle in haystack => $pos
# $pos >= 0 if found; $pos = false if nothing found
pos|strpos $haystack $needle $pos
