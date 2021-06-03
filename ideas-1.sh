## VARIABLES ##
# $2 => $1
mov $1 $2	|	set $1 $2

# load $1 from root scope into current scope
glob $1

# vartypes:
# null
# bool
# int
# float
# char
# string => char[]



## MATH ##
# $1 + $2 => $1
add $1 $2

# $1 - $2 => $1
sub $1 $2

# $1 * $2 => $1
mul $1 $2

# $1 / $2 => $1
div $1 $2

# $1 % $2 => $1
mod $1 $2



## CONDITIONS ##
# only execute next line if cond is true
ifl cond

# skip next line if cond is true
ifn cond

# cond:
# x
# !x
# x == y
# x != y
# x === y
# x !== y
# x < y
# x <= y
# x > y
# x >= y



## JUMPS ##
# jump to line 42 (jumping to lines inside of other scopes is not allowed)
jmp 42	|	goto 42

# jump to a flag called "flag1" (flags are stored per-scope)
jmp "flag1"	|	goto "flag1"

# set flag called "flag1"
:flag1	|	:flag1:	|	flag1:



## OUTPUT ##
# print "blabliblub"
drw "bla" "bli" "blub"	|	echo "bla" "bli" "blub"

# initialize matrix with 16x16
pxl size 16 16	|	pxl size 16

# set output resolution to 256x256
pxl res 256 256	|	pxl res 256

# enable autodraw
pxl autodraw true

# set pixel at 2|12 to color #F6F6F6
pxl set 2 12 "F6"

# update matrix to screen
pxl draw



## FUNCTIONS ##
# - functions have their own scopes
# - they can call other functions
# - their own vars are private
# - they can't acces root-scope's vars (except they were made global using `glob`)
# - args with $-prefix are copied into local scope
# - args with &-prefix are passed to parent scope

# the function scope "myfunction1" starts here
# argument $1 is readonly; $2 is read/write
fcn myfunction1 $1 &2

# current function scope ends here
ncf

# call a function called "myfunction1"
# arg $1 = 42; arg $2 = $test (returned to parent scope)
myfunction1 42 $test



## RETURN, END, ETC. ##
# end the programm
end	|	halt

# return from function to parent scope
# halt programm in root scope
return



## LISTS ##
# set $a to empty list
set $a []

# set $a to list
set $a [1, 5, 2345]

# print 2nd element
echo $a[1]

# remove 2nd element
set $a[1] null

# push element
set $a[] "blabla"

# print last element
echo $a[-1]

# remove (and get) last element
pop $a[-1]	|	pop $a[-1] $b
