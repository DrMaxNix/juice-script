## COMMENTS ##
# one-line comments (from prefix to EOL)
mov $1 42 # comment
mov $1 42 // comment

# block comments
/*
	Block comment
*/

/* Also a block comment */

mov /* Inline block comment */ $1 42


## DELIMITERS ##
# `;` acts like a fake newline
mov $1 42; typ $1; echo $1


## ESCAPE SEQUENCES AND INTEGER PREFIXES ##
# quote escaping
"Here comes a quote: \"Lorem ipsum\". This had to be escaped!"
"Here comes another quote: 'Lorem ipsum'. This didn't require escaping!"

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
# only execute next line if <cond> is true
if|ifl <cond>

# value to bool
$1		# same as `$1 == true`
!$1		# same as `$1 != true`

# loosely typed compare
$1 == $2
$1 != $2

# strongly typed compare
$1 === $2
$1 !== $2

# numerical / alphabetical compare
$1 < $2
$1 <= $2
$1 > $2
$1 >= $2



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
def myfunction1 $1 &$2

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

# set $1 to empty list
set $1 []

# set $1 to list
set $1 [1, 5, 2345]

# print 2nd element of 4th list
echo $1[3][1]

# remove 2nd element (maintaining key association)
set $1[1] null

# push element
set $1[] "blabla"	|	add $1 "blabla"

# print last element
echo $1[-1]

# remove (and get) last element (keys will be re-ordered)
pop $1[-1]	|	pop $1[-1] $2

# get length of list $2 => $1
len $1 $2



## EXTERNAL VALUES ##
# get unix time => $1
time $1

# get formated time => $1
time $1 "YYYY-MM-DD"

# get random integer between 0 and 3 => $1
rnd|rand|random $1 3

# get random integer between 5 and 13 => $1
rnd|rand|random $1 5 13



## STRING MANIPULATION ##
# get number $1 as string
cast $1 str

# get utf-8 char with id $1 => $1
chr $1

# get length of string $2 => $1
len $1 $2

# concat strings $1 + $2 => $1
add $1 $2 ...

# get substr 2(-5) of string $1 => $1
slice|substr $1 2 5	|	slice|substr $1 2

# repeat string $1 3 times => $1
mul $1 3

# get position of first occourance of $3 (=needle) in $2 (=haystack) => $1
# pos >= 0 if found; pos = false if nothing found
pos|strpos $1 $2 $3
