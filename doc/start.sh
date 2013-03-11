#!/bin/bash
PATH=$PATH:/home/stefan/.rvm/bin
source "/home/collin/.rvm/scripts/rvm"
source ".rvmrc"  # loading local rvmrc if necessary
# or thin or unicorn start at this point, do NOT start as daemon, upstart handles daemonizing for you
rails s -e production -p 7890