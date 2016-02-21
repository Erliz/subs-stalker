/**
 * Subs package
 *
 * @package   Erliz\SubsBundle
 * @author    Stanislav Vetlovskiy <mereliz@gmail.com>
 * @copyright Copyright (c) Stanislav Vetlovskiy
 * @license   http://opensource.org/licenses/GPL-3.0 GPL v3
 */

export default () => {
    let args = [];
    process.argv.forEach((arg, index, array) => {
        if (index < 2) {
            return;
        }
        let [key, val] = arg.split('=');
        if (val) {
            if (val.includes(',')) {
                val = val.split(',');
            }
            args[key] = val;
        }
    });
    return args;
}
