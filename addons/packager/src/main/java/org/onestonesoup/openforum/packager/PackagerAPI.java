package org.onestonesoup.openforum.packager;

import org.onestonesoup.openforum.filemanager.Resource;
import org.onestonesoup.openforum.filemanager.ResourceFolder;
import org.onestonesoup.openforum.filemanager.ResourceStore;
import org.onestonesoup.openforum.plugin.SystemAPI;
import org.onestonesoup.openforum.security.AuthenticationException;
import org.onestonesoup.openforum.security.Authorizer;
import org.onestonesoup.openforum.security.Login;
import org.onestonesoup.openforum.security.User;
import org.onestonesoup.openforum.security.cookie.SessionCookieAuthenticator;
import org.onestonesoup.openforum.zip.Zipper;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.Properties;

public class PackagerAPI extends SystemAPI {

    private static String VERSION = null;

    public String getVersion() {
        if (VERSION != null) {
            return VERSION;
        }
        try {
            Properties props = new Properties();
            props.load(this.getClass().getResourceAsStream("/META-INF/maven/org.onestonesoup/packager/pom.properties"));
            VERSION = props.getProperty("version");

        } catch (Exception exception) {
            VERSION = "Unknown";
        }
        return VERSION;
    }

    public void createZipFile( String pageName, String[] fileList, String zipFileName, String sessionId) throws Exception {
        String zipPageName = pageName;
        if( zipFileName.indexOf("/")!=-1 ) {
            zipPageName = zipFileName.substring( 0,zipFileName.lastIndexOf("/") );
            zipFileName = zipFileName.substring( zipFileName.lastIndexOf("/")+1 );
        }

        Login login = getLogin( sessionId );

        if (getController().getAuthorizer().isAuthorized(login, Authorizer.ACTION_UPDATE,
                zipPageName) == false) {
            throw new AuthenticationException("No save rights");
        }

        OutputStream outputStream = getController().getFileManager().getAttachmentOutputStream( pageName, zipFileName, login );
        Zipper zipper = new Zipper( outputStream);

        for(int i=0; i<fileList.length; i++){
            String entryPageName = pageName;
            String entryFileName = fileList[i];
            if( entryFileName.indexOf("/")!=-1 ) {
                entryPageName = entryFileName.substring( 0,entryFileName.lastIndexOf("/") );
                entryFileName = entryFileName.substring( entryFileName.lastIndexOf("/")+1 );
            }

            InputStream iStream = getController().getFileManager().getAttachmentInputStream( entryPageName, entryFileName, login );
            zipper.addEntry( fileList[i], iStream );
        }
        zipper.close();
    }

    public void packagePage( String pageName, boolean excludeChildFolders, String[] excludedFiles, String sessionId ) throws Exception {
        Login login = getLogin( sessionId );
        if (getController().getAuthorizer().isAuthorized(login, Authorizer.ACTION_UPDATE,
                pageName) == false) {
            throw new AuthenticationException("No save rights for "+pageName);
        }

        ResourceFolder folder = getController().getFileManager().getFolder(pageName, false, login);
        if (folder == null) {
            return;
        }

        String packageName = pageName.substring( pageName.lastIndexOf("/")+1 );
        OutputStream outputStream = getController().getFileManager().getAttachmentOutputStream( pageName, packageName+".wiki.zip", login );

        Zipper zipper = new Zipper( outputStream);

        ResourceStore resourceStore = getController().getFileManager().getResourceStore( login );

        zipAll(zipper, resourceStore, folder, excludeChildFolders, excludedFiles, login);

        zipper.close();
    }

    private void zipAll(Zipper zipper, ResourceStore resourceStore, ResourceFolder folder, boolean excludeChildFolders, String[] excludedFiles, Login login) throws IOException, AuthenticationException {
        if (getController().getAuthorizer().isAuthorized(login, Authorizer.ACTION_READ,
                folder.getPath()) == false) {
            throw new AuthenticationException("No read rights for " + folder);
        }

        ResourceFolder[] folderList = resourceStore.listResourceFolders(folder);

        if(excludeChildFolders==false) {
            for (int loop = 0; loop < folderList.length; loop++) {
                if (folderList[loop].getName().endsWith("history"))
                    continue;
                //if (folderList[loop].getName().endsWith("private"))
                //    continue;
                zipAll(zipper, resourceStore, folderList[loop], false, excludedFiles, login);
            }
        }

        Resource[] list = resourceStore.listResources(folder);
        for (Resource resource : list) {
            String entryName = resource.getPath() + "/"
                    + resource.getName();
            if (entryName.contains(".wiki.zip")) {
                continue;
            }
            boolean exclude = false;
            for (String excludedFile : excludedFiles) {
                if (
                        excludedFile.equals( resource.getName() ) ||
                                excludedFile.equals(entryName) ||
                                entryName.matches( excludedFile ) ||
                                resource.getName().matches( excludedFile )
                ) {
                    exclude = true;
                    break;
                }
            }
            if (exclude) {
                continue;
            }
            if (entryName.charAt(0) == '/') {
                entryName = entryName.substring(1);
            }
            zipper.addEntry(entryName, resourceStore.getInputStream(resource));
        }
    }

    private Login getLogin(String sessionId) {
        String userName = ((SessionCookieAuthenticator)getController().getAuthenticator()).getMemberAlias( sessionId );
        Login login  = new Login();
        login.setSessionId(sessionId);
        login.setUser( new User(userName) );
        login.setLoggedIn(true);

        return login;
    }
}
