package org.onestonesoup.openforum.catalogue;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import org.onestonesoup.core.data.EntityTree;
import org.onestonesoup.core.data.EntityTree.TreeEntity;
import org.onestonesoup.core.data.XmlHelper;
import org.onestonesoup.openforum.OpenForumNameHelper;
import org.onestonesoup.openforum.controller.OpenForumController;
import org.onestonesoup.openforum.security.AuthenticationException;

public class PagesCatalogue {

	private OpenForumController controller;
	private EntityTree catalogue;

	public PagesCatalogue(OpenForumController controller,
			EntityTree catalogue) {
		this.controller = controller;
		if (catalogue == null) {
			this.catalogue = new EntityTree("catalogue");
		} else {
			this.catalogue = catalogue;
		}

		cleanCatalogue();
	}

	public void cleanCatalogue() {
		try {
			List<String> pages = controller.getFileManager().getPageList(
					controller.getSystemLogin());
			for (int loop = 0; loop < pages.size(); loop++) {
				addPage((String) pages.get(loop));
			}
		} catch (Exception e) {
			e.printStackTrace();
		}

		EntityTree toRemove = new EntityTree("old");
		for (int loop = 0; loop < catalogue.getChildren().size(); loop++) {
			EntityTree.TreeEntity page = catalogue.getChildren().get(loop);

			try {
				if (controller.getFileManager()
						.pageExists(page.getAttribute("title"),
								controller.getSystemLogin()) == false) {
					toRemove.addChild(page);
				} else {
					long timeStamp = controller.getFileManager()
							.getPageTimeStamp(page.getAttribute("title"),
									controller.getSystemLogin());
					page.setAttribute("lastChanged", "" + timeStamp);
				}
			} catch (Exception e) {
				e.printStackTrace();
				toRemove.addChild(page);
			}
		}

		for (int loop = 0; loop < toRemove.getChildren().size(); loop++) {
			String title = toRemove.getChildren().get(loop)
					.getAttribute("title");
			removePage(title);

			controller.getLogger().info("Removed old page reference to " + title);
		}
	}

	public EntityTree.TreeEntity addPage(String pageName) throws IOException,
			AuthenticationException {
		String title = getRegularName(pageName);

		long lastChanged = 0;
		try {
			lastChanged = controller.getFileManager().getPageTimeStamp(pageName,
					controller.getSystemLogin());
		} catch (Exception e) {
			e.printStackTrace();
		}

		EntityTree.TreeEntity page = findPage(catalogue.getRoot(), title);

		if (page == null && lastChanged != -1) {
			page = catalogue.addChild("page");
			page.setAttribute("title", title);
			page.setAttribute("pageName", pageName);
			page.setAttribute("lastChanged", "" + lastChanged);
			page.addChild("refersTo");
			page.addChild("referredToBy");
			page.addChild("tags");

			System.out.println("Added reference to page " + title);
		}
		if (page != null) {
			page.setAttribute("lastChanged", "" + lastChanged);
		}

		return page;
	}

	private TreeEntity findPage(EntityTree.TreeEntity tag, String title) {
		EntityTree.TreeEntity page = null;
		for (EntityTree.TreeEntity entity : tag.getChildren("page")) {
			if (entity.hasAttribute("title")
					&& entity.getAttribute("title").equals(title)) {
				page = entity;
				break;
			}
		}
		return page;
	}

	public void removePage(String title) {
		title = getRegularName(title);

		EntityTree.TreeEntity page = findPage(catalogue.getRoot(), title);
		if (page != null) {
			catalogue.removeChild(page);
		}
	}

	public void setPageTags(String title, String tagsString) {
		title = getRegularName(title);

		EntityTree.TreeEntity pageTags = findPage(catalogue.getRoot(), title)
				.getChild("tags");
		if (pageTags == null) {
			return;
		}

		String[] tags = tagsString.split(" ");

		pageTags.removeChildren("tag");

		for (int loop = 0; loop < tags.length; loop++) {
			pageTags.addChild("tag").setValue(tags[loop]);
		}
	}

	public void addReference(String fromPageTitle, String toPageTitle)
			throws IOException, AuthenticationException {
		fromPageTitle = getRegularName(fromPageTitle);
		toPageTitle = getRegularName(toPageTitle);

		if (fromPageTitle.equals("/PagesIndex")) {
			return;
		}

		EntityTree.TreeEntity fromPage = addPage(fromPageTitle);
		if (fromPage != null) {
			EntityTree.TreeEntity fromPageRefersTo = fromPage
					.getChild("refersTo");
			if (findPage(fromPageRefersTo, toPageTitle) == null) {
				fromPageRefersTo.addChild("page").setAttribute("title",
						toPageTitle);
			}
		}
		EntityTree.TreeEntity toPage = addPage(toPageTitle);
		if (toPage != null) {
			EntityTree.TreeEntity toPageReferredToBy = toPage
					.getChild("referredToBy");
			if (findPage(toPageReferredToBy, fromPageTitle) == null) {
				toPageReferredToBy.addChild("page").setAttribute("title",
						fromPageTitle);
			}
		}
	}

	public EntityTree.TreeEntity getReferringPages(String pageTitle) {
		pageTitle = getRegularName(pageTitle);
		EntityTree.TreeEntity result = findPage(catalogue.getRoot(), pageTitle);
		if (result != null) {
			result = result.getChild("referredToBy");
		}

		if (result == null || result.getChildren().size() == 0) {
			if (result == null) {
				result = new EntityTree("results").getRoot();
			}
			EntityTree.TreeEntity tempResult = findPage(catalogue.getRoot(),
					pageTitle);
			if (tempResult != null) {
				for (int loop = 0; loop < tempResult.getChildren().size(); loop++) {
					EntityTree.TreeEntity found = tempResult.getChildren().get(
							loop);
					result.addChild(found);
				}
			}
		}

		return result;
	}

	public EntityTree.TreeEntity getPageTags(String pageTitle) {
		pageTitle = getRegularName(pageTitle);
		EntityTree.TreeEntity result = findPage(catalogue.getRoot(), pageTitle);
		if (result != null) {
			return result.getChild("tags");
		}
		return null;
	}

	public EntityTree.TreeEntity getPagesReferredTo(String pageTitle) {
		pageTitle = getRegularName(pageTitle);
		return findPage(catalogue.getRoot(), pageTitle).getChild("refersTo");
	}

	public boolean pageExists(String pageTitle) {
		pageTitle = getRegularName(pageTitle);

		if (findPage(catalogue.getRoot(), pageTitle) == null) {
			return false;
		} else {
			return true;
		}
	}

	public EntityTree getPagesChanged(long fromTime, long toTime, String regex) {
		List<EntityTree.TreeEntity> pages = catalogue.getChildren("page");
		EntityTree pagesChanged = new EntityTree("pagesChanged");
		pagesChanged.setAttribute("fromTime", "" + fromTime);
		pagesChanged.setAttribute("toTime", "" + toTime);

		for (int loop = 0; loop < pages.size(); loop++) {
			EntityTree.TreeEntity page = pages.get(loop);
			if (page.getAttribute("title").matches(regex) == false) {
				continue;
			}

			long lastChanged = Long.parseLong(page.getAttribute("lastChanged"));

			if (lastChanged >= fromTime && lastChanged <= toTime) {
				pagesChanged.addChild(page);
			}
		}

		return pagesChanged;
	}

	public List<String> getPageNames() {
		ArrayList<String> pages = new ArrayList<String>();
		for (int loop = 0; loop < catalogue.getChildren().size(); loop++) {
			pages.add(catalogue.getChildren().get(loop).getAttribute("title"));
		}
		return pages;
	}

	public String toString() {
		return XmlHelper.toXml(catalogue);
	}

	public String getRegularName(String title) {
		title = OpenForumNameHelper.titleToWikiName(title);
		if (title.length() == 0 || title.charAt(0) != '/') {
			title = '/' + title;
		}

		return title;
	}
}
