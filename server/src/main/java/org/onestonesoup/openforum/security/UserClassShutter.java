package org.onestonesoup.openforum.security;

import org.mozilla.javascript.ClassShutter;

/**
 * Created by nik on 12/08/16.
 */
public class UserClassShutter implements ClassShutter {

    private Login login;

    public UserClassShutter(Login login) {
        this.login = login;
    }

    @Override
    public boolean visibleToScripts(String fullClassName) {
        return true;
    }
}
