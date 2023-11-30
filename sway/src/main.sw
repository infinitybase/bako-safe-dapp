contract;

use std::logging::log;

abi MyContract {
    fn return_true(val1: u64) -> u64;
}

impl MyContract for Contract {
    fn return_true(val1: u64) -> u64 {
        log(val1);
        val1
    }
}
